# Handling Redirects@Edge
URL redirection is a powerful tool leveraged by website owners for a variety of reasons such as running marketing activities, integration with 3rd party resources, content migration etc. But as the number of redirects increase, it can become cumbersome to manage them.

In this reference architecture, we will explore how you can leverage Lambda@Edge to offload URL redirection logic from the origin to the edge. This simplifies origin infrastructure and reduces the response time to serve these redirects as they are now being generated closer to the end users.

Also, the simple custom-build user interface discussed in this solution makes URL redirection simple to setup and use, even for non-technical resources. For example, your marketing teams can now self-serve their request to setup vanity URLs for SEO (search engine optimizations) without being dependent on their DevOps team.

## Setup Instructions on a Amazon Linux 2 EC2 instance

Pre-requisites:

1. Install [Docker](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/docker-basics.html) by following the instructions in the 'Installing Docker on Amazon Linux 2'

2. Install git using command ```sudo yum install git -y```

2. Install [Node.js & npm](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html)

3. Install [bower](https://bower.io/) using
```npm install -g bower```

4. Configure AWS CLI Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) & set it up to connect to your AWS account using the command ```aws configure```

## Steps:

1. Clone this repository using command
```git clone https://github.com/aws-samples/aws-lambda-redirection-at-edge```

2.  From a terminal move into this folder and set CODE_BUCKET environment variable. A new bucket of format {CODE_BUCKET}-us-east-1 is created which holds the code assets for deployment.

```export CODE_BUCKET=YOUR BUCKET NAME```

3. Run ```make deploy```
This would build the project and copy the assets into S3 bucket for deployment.You will also see the complete CloudFormation deployment URL when the execution completes.

4. Copy & paste this URL in your browser to start deploying the CloudFormation template.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
