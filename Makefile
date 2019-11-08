.PHONY: dist validate clean

bucket = ${CODE_BUCKET}
regions = us-east-1

image:
	docker build --tag redirection:lambci8.10 .

build: image
		docker run --rm --volume ${PWD}/lambda/origin-request-function:/build redirection:lambci8.10 /bin/bash -c "npm init -f -y; npm install node-rules@3.2.0 --save; npm install underscore@1.9.1 --save; npm install --only=prod"
		docker run --rm --volume ${PWD}/lambda/deploy-function:/build redirection:lambci8.10 /bin/bash -c "npm init -f -y; npm install adm-zip@0.4.11 --save; npm install generate-password@1.4.2 --save; npm install mime@2.3.1 --save; npm install --only=prod"

		cd userinterface;bower install angular@1.7.0
		cd userinterface;bower install angular-animate@1.7.0
		cd userinterface;bower install angular-route@1.7.0
		cd userinterface;bower install bootstrap@4.1.1
		cd userinterface;bower install moment@2.22.0

package:
		mkdir -p dist && cd lambda/origin-request-function && zip -FS -q -r ../../dist/origin-request-function.zip *
		mkdir -p dist && cd lambda/deploy-function && zip -FS -q -r ../../dist/deploy-function.zip *
		mkdir -p dist && cd userinterface && zip -FS -q -r ../dist/ui.zip *

creates3:
		@for region in $(regions);do echo $$region;	echo $(bucket);aws s3 mb s3://$(bucket)-$$region --region $$region;done

deletes3:
		@for region in $(regions);do echo $$region;	echo $(bucket);aws s3 rb s3://$(bucket)-$$region --force;done

copycode:
		@for region in $(regions);do echo $$region;	echo $(bucket);aws s3 cp dist/deploy-function.zip s3://$(bucket)-$$region/redirection/lambda/latest/ --acl public-read;aws s3 cp dist/origin-request-function.zip s3://$(bucket)-$$region/redirection/lambda/latest/ --acl public-read;aws s3 cp dist/ui.zip s3://$(bucket)-$$region/redirection/ui/latest/ --acl public-read;done

copytemplate:
		sed -e "s/CODE_BUCKET/${bucket}/g" cloudformation/template.yaml > dist/template.yaml
		@for region in $(regions);do echo $$region;	echo $(bucket);aws s3 cp dist/template.yaml s3://$(bucket)-$$region/redirection/template/latest/ --acl public-read;done

deploy: build package creates3 copycode copytemplate
	@echo "Deployment URL"
	@echo " https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/new?stackName=RedirectionEdge&templateURL=https://s3.amazonaws.com/${bucket}-us-east-1/redirection/template/latest/template.yaml";

clean:
	rm -rf ./dist/*
	rm -rf userinterface/bower_components/
