import * as cdk from '@aws-cdk/core';
import * as dynamo from '@aws-cdk/aws-dynamodb';

export class dynamoStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const postsTable = new dynamo.Table(this, "ServerlessBlog-Posts", {
            partitionKey: { name: 'PostID', type: dynamo.AttributeType.NUMBER },
            sortKey: {name: 'Time', type: dynamo.AttributeType.NUMBER},
            tableName: "ServerlessBlog-Posts",
          });

    }
}