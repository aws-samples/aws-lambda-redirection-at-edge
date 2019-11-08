# Handling Redirects@Edge
URL redirection is a powerful tool leveraged by website owners for a variety of reasons such as running marketing activities, integration with 3rd party resources, content migration etc. But as the number of redirects increase, it can become cumbersome to manage them.

In this blog post, we will explore how you can leverage Lambda@Edge to offload URL redirection logic from the origin to the edge. This simplifies origin infrastructure and reduces the response time to serve these redirects as they are now being generated closer to the end users.

Also, the simple custom-build user interface discussed in this blog post makes URL redirection simple to setup and use, even for non-technical resources. For example, your marketing teams can now self-serve their request to setup vanity URLs for SEO (search engine optimisations) without being bottlenecked by the development teams.

#Setup Instructions

Pre-requisites:

1. Install bower
2. AWS CLI setup and configuration
3. Install make

#Steps:

1. Set CODE_BUCKET environment variable. A new bucket of format {CODE_BUCKET}-us-east-1 is created which holds the code assets for deployment.

```export CODE_BUCKET = example_bucket```

1. Run ```make deploy```
This would build the project and copy into code assets into S3 bucket for deployment.
Then open the URL returned from above script in browser to deploy the CloudFormation template.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
