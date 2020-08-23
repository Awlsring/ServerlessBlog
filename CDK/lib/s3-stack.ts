import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as deploy from '@aws-cdk/aws-s3-deployment';

export class s3Stack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const webBucket = new s3.Bucket(this, 'ServerlessBlog-Files', {
            bucketName: "serverless-blog-files-bucket",
            publicReadAccess: true
        });

        new deploy.BucketDeployment(this, 'DeployWebsite', {
            sources: [deploy.Source.asset('../HTML')],
            destinationBucket: webBucket
        })

    }
}