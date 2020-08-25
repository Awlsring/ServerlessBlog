import boto3
from boto3.dynamodb.conditions import Key
from jinja2 import Environment, FileSystemLoader, Template
from datetime import datetime

def lambda_handler(event, context):
    '''
    Function that grabs html files from S3 Bucket, creates a Jinja template, and returns
    webpage from inputs

    :event['PostID'] string: Converted to int in function. 

    :return html
    '''
    
    # Converts input to int for querying
    postID = int(event['PostID'])
    
    # Sets environment as /tmp/ on Lambda invoker
    file_loader = FileSystemLoader('/tmp/')
    env = Environment(loader=file_loader)

    # Creates s3 boto client
    s3 = boto3.client('s3')
    
    # Creates resource for Posts table
    dynamo = boto3.resource('dynamodb')
    table = dynamo.Table('ServerlessBlog-Posts')

    # Downloads home and layout html docs from S3
    s3.download_file("serverless-blog-files-bucket", "post.html", "/tmp/post.html")
    s3.download_file("serverless-blog-files-bucket", "layout.html", "/tmp/layout.html")

    # Creates Jinja template from post.html
    template = env.get_template('post.html')

    # Grabs queried entry
    post = table.query(
        KeyConditionExpression=Key('PostID').eq(postID),
    )

    # Checks if post was recieved. Post error if not found. If found formats for rendering.
    if len(post['Items']) == 1:
        wantedPost = post['Items'][0]
        wantedPost['Time'] = wantedPost['Time'] - 25200
        wantedPost['Time'] = datetime.fromtimestamp(wantedPost['Time']).strftime("%m-%d-%Y at %I:%M PT")
    else:
        wantedPost = {}
        wantedPost['Title'] = 'Error. Post Not Found'

    # Renders page
    page = template.render(post=wantedPost)
    
    # Returns as HTML to browser
    return page