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
    const decoded = jwt.verify(
      token,
      jwtSecret
    ) as AuthPayload

    if (!decoded.userId) {
      return null
    }

    return decoded.userId
  } catch {
    return null
  }
}

function uploadToCloudinary(
  buffer: Buffer,
  userId: string
): Promise<{
  secure_url: string
  public_id: string
}> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "invoice-flow/profile-images",
        public_id: `user-${userId}`,
        overwrite: true,
        invalidate: true,

        transformation: [
          {
            width: 500,
            height: 500,
            crop: "fill",
            gravity: "face",
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
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
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
          error: "Please select an image to upload.",
        },
        {
          status: 400,
        }
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
        {
          status: 400,
        }
      )
    }

    // ---------------------------------------------------------
    // 4. Validate file size
    // ---------------------------------------------------------

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Image must be smaller than 5 MB.",
        },
        {
          status: 400,
        }
      )
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          error: "The selected image is empty.",
        },
        {
          status: 400,
        }
      )
    }

    // ---------------------------------------------------------
    // 5. Get current profile image
    // ---------------------------------------------------------

    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        profileImagePublicId: true,
      },
    })

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      )
    }

    // ---------------------------------------------------------
    // 6. Upload to Cloudinary
    // ---------------------------------------------------------

    const buffer = Buffer.from(
      await file.arrayBuffer()
    )

    const uploadedImage = await uploadToCloudinary(
      buffer,
      userId
    )

    // ---------------------------------------------------------
    // 7. Save image information
    // ---------------------------------------------------------

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        profileImageUrl: uploadedImage.secure_url,
        profileImagePublicId: uploadedImage.public_id,
      },

      select: {
        id: true,
        profileImageUrl: true,
        profileImagePublicId: true,
      },
    })

    // ---------------------------------------------------------
    // 8. Delete old Cloudinary image
    // ---------------------------------------------------------

    if (
      currentUser.profileImagePublicId &&
      currentUser.profileImagePublicId !==
        uploadedImage.public_id
    ) {
      try {
        await cloudinary.uploader.destroy(
          currentUser.profileImagePublicId,
          {
            resource_type: "image",
            invalidate: true,
          }
        )
      } catch (error) {
        // The new image is already saved.
        // Do not fail the request because cleanup failed.
        console.error(
          "Failed to delete old profile image:",
          error
        )
      }
    }

    return NextResponse.json({
      success: true,
      profileImageUrl:
        updatedUser.profileImageUrl,
    })
  } catch (error) {
    console.error(
      "Upload profile image error:",
      error
    )

    return NextResponse.json(
      {
        error: "Failed to upload profile image.",
      },
      {
        status: 500,
      }
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
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      )
    }

    // ---------------------------------------------------------
    // 2. Get current image
    // ---------------------------------------------------------

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        profileImagePublicId: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      )
    }

    // ---------------------------------------------------------
    // 3. Delete from Cloudinary
    // ---------------------------------------------------------

    if (user.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(
          user.profileImagePublicId,
          {
            resource_type: "image",
            invalidate: true,
          }
        )
      } catch (error) {
        console.error(
          "Failed to delete Cloudinary profile image:",
          error
        )

        return NextResponse.json(
          {
            error:
              "Failed to remove profile image.",
          },
          {
            status: 500,
          }
        )
      }
    }

    // ---------------------------------------------------------
    // 4. Clear database fields
    // ---------------------------------------------------------

    await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        profileImageUrl: null,
        profileImagePublicId: null,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(
      "Delete profile image error:",
      error
    )

    return NextResponse.json(
      {
        error: "Failed to remove profile image.",
      },
      {
        status: 500,
      }
    )
  }
}