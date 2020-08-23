# CDK

Before working with this project, you will need to get install CDK. Follow this doc to get started: https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html

## Stacks

Code for this project is broken into 3 stacks

- #### Api Gateway Stack
Generates the Api Gateway and Lambda Functions it uses.

- #### Dynamo Stack
Generates the table posts are stored in.

- #### S3 Stack
Generates  the S3 bucket the webfiles are kept in, and deploys them to S3.

## Get Started

After your clone this repo and have CDK CLI configured, navigate to ServerlessBlog/CDK.

- Run command `npm run build` to generate js from the typescript files.
- Run `cdk deploy *` to deploy all the stacks. This will require you to respond to prompts from CDK.
- After all these have run, in your terminal you should see the output of Api Gateway address. Visit that to see if it worked.



### Other CDK commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template