import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

import { prisma } from "@repo/db"
import { cloudinary } from "@/lib/cloudinary"

const MAX_FILE_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

interface AuthPayload {
  userId: string
}

async function authenticateUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value

  if (!token) {
    return null
  }

  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error(
      "JWT_SECRET environment variable is missing from configuration."
    )
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthPayload

    return decoded.userId || null
  } catch {
    return null
  }
}

function uploadBusinessLogo(
  buffer: Buffer,
  userId: string
): Promise<{
  secure_url: string
  public_id: string
}> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "invoice-flow/business-logos",
        public_id: `business-${userId}`,
        overwrite: true,
        invalidate: true,

        transformation: [
          {
            width: 600,
            height: 600,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },

      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        if (!result?.secure_url || !result.public_id) {
          reject(
            new Error(
              "Cloudinary did not return a valid upload result."
            )
          )
          return
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        })
      }
    )

    uploadStream.end(buffer)
  })
}

export async function POST(req: NextRequest) {
  try {
    // ---------------------------------------------------------
    // 1. Authentication
    // ---------------------------------------------------------

    const userId = await authenticateUser(req)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // ---------------------------------------------------------
    // 2. Read uploaded file
    // ---------------------------------------------------------

    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Please select a logo to upload.",
        },
        { status: 400 }
      )
    }

    // ---------------------------------------------------------
    // 3. Validate file type
    // ---------------------------------------------------------

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid image type. Please upload a JPG, PNG, or WEBP image.",
        },
        { status: 400 }
      )
    }

    // ---------------------------------------------------------
    // 4. Validate file size
    // ---------------------------------------------------------

    if (file.size === 0) {
      return NextResponse.json(
        {
          error: "The selected image is empty.",
        },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Logo must be smaller than 5 MB.",
        },
        { status: 400 }
      )
    }

    // ---------------------------------------------------------
    // 5. Get current business profile
    // ---------------------------------------------------------

    const currentBusinessProfile =
      await prisma.businessProfile.findUnique({
        where: {
          userId,
        },
        select: {
          id: true,
          logoPublicId: true,
        },
      })

    if (!currentBusinessProfile) {
      return NextResponse.json(
        {
          error:
            "Please create your business profile before uploading a logo.",
        },
        { status: 404 }
      )
    }

    // ---------------------------------------------------------
    // 6. Upload to Cloudinary
    // ---------------------------------------------------------

    const buffer = Buffer.from(await file.arrayBuffer())

    const uploadedLogo = await uploadBusinessLogo(
      buffer,
      userId
    )

    // ---------------------------------------------------------
    // 7. Save logo information
    // ---------------------------------------------------------

    const updatedBusinessProfile =
      await prisma.businessProfile.update({
        where: {
          userId,
        },
        data: {
          logoUrl: uploadedLogo.secure_url,
          logoPublicId: uploadedLogo.public_id,
        },
        select: {
          id: true,
          logoUrl: true,
          logoPublicId: true,
        },
      })

    // ---------------------------------------------------------
    // 8. Delete old Cloudinary logo
    // ---------------------------------------------------------

    if (
      currentBusinessProfile.logoPublicId &&
      currentBusinessProfile.logoPublicId !==
        uploadedLogo.public_id
    ) {
      try {
        await cloudinary.uploader.destroy(
          currentBusinessProfile.logoPublicId,
          {
            resource_type: "image",
            invalidate: true,
          }
        )
      } catch (error) {
        console.error(
          "Failed to delete old business logo:",
          error
        )
      }
    }

    return NextResponse.json({
      success: true,
      logoUrl: updatedBusinessProfile.logoUrl,
    })
  } catch (error) {
    console.error(
      "Upload business logo error:",
      error
    )

    return NextResponse.json(
      {
        error: "Failed to upload business logo.",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // ---------------------------------------------------------
    // 1. Authentication
    // ---------------------------------------------------------

    const userId = await authenticateUser(req)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // ---------------------------------------------------------
    // 2. Get current business logo
    // ---------------------------------------------------------

    const businessProfile =
      await prisma.businessProfile.findUnique({
        where: {
          userId,
        },
        select: {
          logoPublicId: true,
        },
      })

    if (!businessProfile) {
      return NextResponse.json(
        {
          error: "Business profile not found.",
        },
        { status: 404 }
      )
    }

    // ---------------------------------------------------------
    // 3. Delete from Cloudinary
    // ---------------------------------------------------------

    if (businessProfile.logoPublicId) {
      try {
        await cloudinary.uploader.destroy(
          businessProfile.logoPublicId,
          {
            resource_type: "image",
            invalidate: true,
          }
        )
      } catch (error) {
        console.error(
          "Failed to delete Cloudinary business logo:",
          error
        )

        return NextResponse.json(
          {
            error: "Failed to remove business logo.",
          },
          { status: 500 }
        )
      }
    }

    // ---------------------------------------------------------
    // 4. Clear database fields
    // ---------------------------------------------------------

    await prisma.businessProfile.update({
      where: {
        userId,
      },
      data: {
        logoUrl: null,
        logoPublicId: null,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(
      "Delete business logo error:",
      error
    )

    return NextResponse.json(
      {
        error: "Failed to remove business logo.",
      },
      { status: 500 }
    )
  }
}