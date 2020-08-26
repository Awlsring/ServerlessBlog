import * as cdk from '@aws-cdk/core';
import * as api from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import { Duration } from '@aws-cdk/core';

export class apiGatewayStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda Resources

    // Creates Jinja Layer for Lambda Functions
    const jinjaLayer = new lambda.LayerVersion(this, "Jinja2Layer", {
      code: lambda.Code.fromAsset('../PythonLambda/lib/jinja2_2112/jinja2.zip'),
      compatibleRuntimes: [ lambda.Runtime.PYTHON_3_8 ] ,
      description: "Lambda Layer for Jinja2",
      layerVersionName: "Jinja2"
    })

    // Creates Query Page Function
    const queryHandler = new lambda.Function(this, 'Query', {
      runtime: lambda.Runtime.PYTHON_3_8,
      layers: [ jinjaLayer ],
      handler: 'query.lambda_handler',
      code: lambda.Code.fromAsset('../PythonLambda/Handlers'),
      memorySize: 512,
      tracing: lambda.Tracing.ACTIVE,
      timeout: Duration.seconds(5),
      functionName: 'Get-Query',
      role: new iam.Role(this, 'get-QueryRole', {
          assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
          roleName: 'Lambda-Get-Query-Role'
      })
    });

    // Allows function to access bucket made in S3 Stack and Table made in Dynamo Stack
    queryHandler.addToRolePolicy(new iam.PolicyStatement( {
      resources: [ 'arn:aws:s3:::serverless-blog-files-bucket', 'arn:aws:s3:::serverless-blog-files-bucket/*', 'arn:aws:dynamodb:us-west-2:742762521158:table/ServerlessBlog-Posts', 'arn:aws:dynamodb:us-west-2:742762521158:table/ServerlessBlog-CountTotal' ],
      actions: [ 's3:GetObject', 's3:PutObject', 'dynamodb:Describe*', 'dynamodb:List*', 'dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan']
    }));

    // Creates Generic Page Function
    const pageHandler = new lambda.Function(this, 'Page', {
      runtime: lambda.Runtime.PYTHON_3_8,
      layers: [ jinjaLayer ],
      handler: 'get_page.lambda_handler',
      code: lambda.Code.fromAsset('../PythonLambda/Handlers'),
      memorySize: 512,
      tracing: lambda.Tracing.ACTIVE,
      timeout: Duration.seconds(5),
      functionName: 'Get-Page',
      role: new iam.Role(this, 'get-PageRole', {
          assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
          roleName: 'Lambda-Get-Page-Role'
      })
    });

    // Allows function to access bucket made in S3 Stack and Table made in Dynamo Stack
    pageHandler.addToRolePolicy(new iam.PolicyStatement( {
      resources: [ 'arn:aws:s3:::serverless-blog-files-bucket', 'arn:aws:s3:::serverless-blog-files-bucket/*', 'arn:aws:dynamodb:us-west-2:742762521158:table/ServerlessBlog-Posts', 'arn:aws:dynamodb:us-west-2:742762521158:table/ServerlessBlog-CountTotal' ],
      actions: [ 's3:GetObject', 's3:PutObject', 'dynamodb:Describe*', 'dynamodb:List*', 'dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan']
    }));

    //API Gateway Resources

    const website = new api.RestApi(this, "WebsiteGateway");

    // Creates Get Method to call Lambda Function that assembles and returns the web page
    website.root.addMethod('Get', new api.LambdaIntegration(pageHandler, {
      proxy: false,
      requestTemplates: {
        'application/json': `{ "Page": "home.html" }`,
      },
      integrationResponses: [{
        statusCode: '200',
        responseTemplates: {
          'text/html': "$input.path('$')"
        },
        responseParameters: {
          "method.response.header.Content-Type": "'text/html'"
        }
      }]
    }),{
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          "method.response.header.Content-Type": true
        }
      }]
    });

    // Creates resource for posts
    const post = website.root.addResource('posts');

    post.addMethod('Get', new api.LambdaIntegration(pageHandler, {
      proxy: false,
      passthroughBehavior: api.PassthroughBehavior.NEVER,
      requestTemplates: {
          'application/json': `{ 
            "PostID": "$input.params('post')",
            "Page": "post.html"
          }`,
      },
      integrationResponses: [{
        statusCode: '200',
        responseTemplates: {
          'text/html': "$input.path('$')"
        },
        responseParameters: {
          "method.response.header.Content-Type": "'text/html'"
        }
      }]
    }),{
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          "method.response.header.Content-Type": true
        }
      }]
    });

    const query = post.addResource('query');

    query.addMethod('Get', new api.LambdaIntegration(queryHandler, {
      proxy: false,
      passthroughBehavior: api.PassthroughBehavior.NEVER,
      requestTemplates: {
          'application/json': `{ "ListNumber": "$input.params('listnumber')" }`,
      },
      integrationResponses: [{
          statusCode: '200',
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET'",
            "method.response.header.Access-Control-Allow-Origin": "'*'"
          },
      }]}), {
      methodResponses: [{ 
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Methods': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
            'method.response.header.Access-Control-Allow-Origin': true,
        },
      }]
    });

  }
}
