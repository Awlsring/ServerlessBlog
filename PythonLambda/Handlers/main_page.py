import boto3
from jinja2 import Environment, FileSystemLoader, Template
import datetime

def lambda_handler(event, context):
    '''
    Function that grabs html files from S3 Bucket, creates a Jinja template, and returns
    webpage from inputs

    :return html
    '''

    # Sets environment as /tmp/ on Lambda invoker
    file_loader = FileSystemLoader('/tmp/')
    env = Environment(loader=file_loader)

    # Creates s3 boto client
    s3 = boto3.client('s3')
    
    # Creates resource for Posts table
    dynamo = boto3.resource('dynamodb')
    table = dynamo.Table('ServerlessBlog-Posts')

    # Downloads home and layout html docs from S3
    s3.download_file("serverless-blog-files-bucket", "home.html", "/tmp/home.html")
    s3.download_file("serverless-blog-files-bucket", "layout.html", "/tmp/layout.html")

    # Creates Jinja template from home.html
    template = env.get_template('home.html')

    # Scan table for entries
    postScan = table.scan()

    # Checks if post count is over limit
    if postScan['Count'] > 10:
        i = 0
        postList = []
        while i > 10:
            postList.append(postScan[i])
            i = i + 1
    else:
        postList = postScan['Items']
    
    # Changes time from epoch to formatted datetime
    for post in postList:
        post['Time'] = datetime.datetime.fromtimestamp(post['Time']).strftime("%d-%m-%Y at %I:%M:")

    # Renders page
    page = template.render(posts=postList)

    # Returns as HTML to browser
    return page