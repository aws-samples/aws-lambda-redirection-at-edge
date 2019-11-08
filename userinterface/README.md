# Walkthrough of the User Interface*

*Login screen :*
![Alt text](../imgs/login-animation.gif?raw=true "Login Screen")

Using the username and password generated we login to the User Interface URL. During first login, you will be prompted to change the password. Please note the new password must conform to your password policy. Once logged-in, you will be taken to the main Rules Manager console.

*Rules console :*
Here you can add various rules under three different sections namely 'Rules',' Wildcards' and 'QueryString'.

Examples:
1. If we want to setup a simple redirect from /index.html to /newindex.html,  we define it under the 'Rules' section by clicking on '+' sign and enter the values as shown below:
![Alt text](../imgs/simplerules-animation.gif?raw=true "Rules Console")

1.  If you want to define a wildcard rule, say redirect all URLs under /oldpath/* path to /newpath/* then you would define it as shown below:
![Alt text](../imgs/wildcardrules-animation.gif?raw=true "Wildcard Rules")

Each rule needs the Original and Redirect URI's, the HTTP response codes (either 301 for Permanent or 302 for Temporary type redirect) and optionally the validity of the rule to be specified.Once the rules are defined you can click the 'Save' to create a new version of the redirector.json file.

Note: We use S3 object versioning (https://docs.aws.amazon.com/AmazonS3/latest/dev/ObjectVersioning.html) feature to maintain previous versions of the rules. This enables us to revert back quickly to an earlier version if need be by simply selecting it from 'Select Version' drop down and click 'Save' again as shown below:
![Alt text](../imgs/revertback-animation.gif?raw=true "Revert to previous")

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
