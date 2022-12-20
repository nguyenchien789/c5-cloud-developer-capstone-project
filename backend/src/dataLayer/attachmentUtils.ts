import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
    constructor(
      private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' })
    ) {}
  
    async createAttachmentPresignedUrl(attachmentId: string): Promise<string> {
        return this.s3.getSignedUrl('putObject', {
            Bucket: process.env.ATTACHMENT_S3_BUCKET,
            Key: attachmentId,
            Expires: parseInt(process.env.SIGNED_URL_EXPIRATION)
        });
    }

    async deleteAttachmentUrl(attachmentId: string) {
        var params = {
            Bucket: process.env.ATTACHMENT_S3_BUCKET,
            Key: attachmentId
           };
        this.s3.deleteObject(params, function(err, data) {
            if (err) console.log(err, err.stack); 
            else     console.log(data);        
        });
    }
}