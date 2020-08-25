import boto3
from jinja2 import Environment, FileSystemLoader, Template
from datetime import datetime

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

    # # Scan table for entries
    # postScan = table.scan()

    # # Checks if post count is over limit
    # if postScan['Count'] > 10:
    #     i = 0
    #     postList = []
    #     while i > 10:
    #         postList.append(postScan[i])
    #         i = i + 1
    # else:
    #     postList = postScan['Items']
    
    # # Changes time from epoch to formatted datetime and adds post URL
    # for post in postList:
    #     post['Time'] = post['Time'] - 25200
    #     post['Time'] = datetime.fromtimestamp(post['Time']).strftime("%m-%d-%Y at %I:%M PT")
    #     post['Url'] = f'https://b5y9tmytqj.execute-api.us-west-2.amazonaws.com/prod/posts?post={post["PostID"]}'

    # Determine Amount of posts on page
    if table.item_count < 10:
        loop_amount = table.item_count

    # create post positions
    i = 0
    postList = []
    while i < loop_amount:
        postList.append(i)
        i = i + 1

    # Renders page
    page = template.render(posts=postList)

    # Returns as HTML to browser
    return page