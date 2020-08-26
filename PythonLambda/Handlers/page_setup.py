import boto3
from boto3.dynamodb.conditions import Key
from datetime import datetime

def determine_page(event):
    page_selector = {
        "home.html": home,
        "post.html": post
    }

    selector = page_selector.get(event['Page'])
    
    return selector(event)
    
def home(event):

    # Creates resource for Posts table
    dynamo = boto3.resource('dynamodb')
    table = dynamo.Table('ServerlessBlog-CountTotal')

    # Query table for total post count
    total = table.query(
        KeyConditionExpression=Key('Index').eq('Index'),
    )

    # Determine Amount of posts on page
    if total['Items'][0]['Count'] < 10:
        loop_amount = total['Items'][0]['Count']

    # Create post positions
    i = 0
    post_list = []
    while i < loop_amount:
        post_list.append(i)
        i = i + 1

    return post_list

def post(event):

    # Converts input to int for querying
    postID = int(event['PostID'])

    # Creates resource for Posts table
    dynamo = boto3.resource('dynamodb')
    table = dynamo.Table('ServerlessBlog-Posts')

    # Query table
    post = table.query(
        KeyConditionExpression=Key('PostID').eq(postID),
    )

    # Checks if post was recieved. Post error if not found. If found formats for rendering.
    if len(post['Items']) == 1:
        wantedPost = post['Items'][0]
        wantedPost['Time'] = wantedPost['Time'] - 25200
        wantedPost['Time'] = datetime.fromtimestamp(wantedPost['Time']).strftime("%m-%d-%Y at %H:%M Pacific")
    else:
        wantedPost = {}
        wantedPost['Title'] = 'Error. Post Not Found'

    return wantedPost

# def registration():

#     return

# def about():

#     return