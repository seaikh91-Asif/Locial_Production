import imagekit from './imagekit.js'

// Best-effort delete of ImageKit files. ImageKit allows up to 100 ids per request.
export const deleteImageKitFiles = async (fileIds = []) => {
    const ids = fileIds.filter(Boolean)

    for (let i = 0; i < ids.length; i += 100) {
        try {
            await imagekit.files.bulk.delete({ fileIds: ids.slice(i, i + 100) })
        } catch (error) {
            console.log('ImageKit delete failed:', error.message)
        }
    }
}