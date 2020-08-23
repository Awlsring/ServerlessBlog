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

    // Creates Main Homepage Function
    const mainHandler = new lambda.Function(this, 'MainPage', {
      runtime: lambda.Runtime.PYTHON_3_8,
      layers: [ jinjaLayer ],
      handler: 'main_page.lambda_handler',
      code: lambda.Code.fromAsset('../PythonLambda/Handlers'),
      tracing: lambda.Tracing.ACTIVE,
      timeout: Duration.seconds(5),
      functionName: 'Get-MainPage',
      role: new iam.Role(this, 'get-MainPageRole', {
          assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
          roleName: 'Lambda-Get-MainPage-Role'
      })
    });

    // Allows function to access bucket made in S3 Stack
    mainHandler.addToRolePolicy(new iam.PolicyStatement( {
      resources: [ 'arn:aws:s3:::serverless-blog-files-bucket', 'arn:aws:s3:::serverless-blog-files-bucket/*', 'arn:aws:dynamodb:us-west-2:742762521158:table/ServerlessBlog-Posts' ],
      actions: [ 's3:GetObject', 's3:PutObject', 'dynamodb:Describe*', 'dynamodb:List*', 'dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan']
    }));

    //API Gateway Resources

    const website = new api.RestApi(this, "WebsiteGateway");

    // Creates Get Method to call Lambda Function that assembles and returns the web page
    website.root.addMethod('Get', new api.LambdaIntegration(mainHandler, {
      proxy: false,
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
  }
}
