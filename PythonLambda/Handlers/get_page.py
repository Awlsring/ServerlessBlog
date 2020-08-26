import boto3
from jinja2 import Environment, FileSystemLoader, Template
import page_setup

def lambda_handler(event, context):
    '''
    Generic Get-Page function that will form a page based off input of what the page should be.

    :return: html rendered page requested
    :rtype:
    '''

    # Create page template
    template = create_page_env(event['Page'])

    # "Switch" statement to determine page functions to run
    variable = page_setup.determine_page(event)
    
    print(variable)
 
    page = template.render(dict=variable)
    
    return page

def create_page_env(page):
    '''
    Generic Get-Page function that will form a page based off input of what the page should be.

    :return: html rendered page requested
    :rtype:
    '''

    # Sets environment as /tmp/ on Lambda invoker
    file_loader = FileSystemLoader('/tmp/')
    env = Environment(loader=file_loader)

    # Creates s3 boto client
    s3 = boto3.client('s3')

    # Downloads requested page and layout html docs from S3
    s3.download_file("serverless-blog-files-bucket", page, f"/tmp/{page}")
    s3.download_file("serverless-blog-files-bucket", "layout.html", "/tmp/layout.html")

    # Creates Jinja template from requested page and returns
    return env.get_template(page)