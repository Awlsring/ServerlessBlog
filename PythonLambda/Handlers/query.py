import boto3
from boto3.dynamodb.conditions import Key
from jinja2 import Environment, FileSystemLoader, Template
from datetime import datetime

def lambda_handler(event, context):
    '''
    Function that grabs dynamo entry based on the position the post is nested in on the homepage.
    Determines ID to be listed by minusing its place from the total object count in the post table.

    :event['ListNumber'] string: Converted to int in function.

    :return: html
    '''

    # Converts input to int for querying
    list_number = int(event['ListNumber'])

    # Creates resource for Posts table
    dynamo = boto3.resource('dynamodb')
    table = dynamo.Table('ServerlessBlog-Posts')

    # Determine post to grab
    index = ( table.item_count - list_number )

    # Query table
    response = table.query(
        KeyConditionExpression=Key('PostID').eq(index),
    )

    # Formats post
    wantedPost = response['Items'][0]
    wantedPost['Time'] = wantedPost['Time'] - 25200
    wantedPost['Time'] = datetime.fromtimestamp(wantedPost['Time']).strftime("%m-%d-%Y at %I:%M PT")

    return wantedPost