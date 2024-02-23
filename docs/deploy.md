## Semi-Automatic Deployment

This deployment method uses the [AWS Amplify](https://aws.amazon.com/amplify/) console to deploy the web app via [AWS CodeCommit](https://aws.amazon.com/codecommit/).

For a more automated deployment, see the relevant section in [the readme](../README.md#automatic-deployment).

### Steps

#### Populate AWS CodeCommit

For other ways of commiting code to AWS CodeCommit, refer to the [Setting up](https://docs.aws.amazon.com/codecommit/latest/userguide/setting-up.html) section in the reference guide.

-   Download the repository as a `.zip` file.

    -   In GitHub, select `Code`, then `Download ZIP`.
    -   In GitLab, select the download icon, then `zip`.
    -   Make a note of the file name (it should be `aws-healthscribe-demo-main.zip`).

-   Navigate to the [AWS console for AWS CodeCommit](https://console.aws.amazon.com/codesuite/codecommit/home).

-   Select _Create repository_.

-   Name the repository `aws-healthscribe-demo`, and select _Create_.

-   At the top of the AWS console, select the AWS CloudShell icon. This is to the right of the search bar, and left of the notifications icon.

-   After CloudShell has loaded, configure git with your email, name, and changing the default branch name to main.

```
git config --global user.email "<email>"
git config --global user.name "<name>"
git config --global init.defaultBranch main
```

<!-- -   Clone the empty repository by running `git clone` followed by the URL in your clipboard. E.g. `git clone codecommit::us-east-1://aws-healthscribe-demo`. -->

-   In the _Actions_ dropdown, then _Upload file_. Select the zip file you downloaded in step 1.

-   Unzip the file to the repository: `unzip <filename>`. E.g. `unzip aws-healthscribe-demo-main.zip`. This extracts the repository into a directory called `aws-healthscribe-demo-main`.

-   Within the repository directory, initialize git: `cd aws-healthscribe-demo-main; git init`

-   In the AWS console for CodeCommit, select _Clone URL_, then _Clone HTTPS (GRC)_. This copies a CodeCommit URL similiar to `codecommit::us-east-1://aws-healthscribe-demo` to your cliipboard.

-   Add the CodeCommit repository: `git remote add origin <clone URL>`, i.e. `git remote add origin codecommit::us-east-1://aws-healthscribe-demo`.

-   Push the files to CodeCommit: `git add -A; git commit -m "Initial commit"; git push -u origin main`

-   Close AWS CloudShell.

#### Deploy using AWS Amplify

-   Navigate to the [AWS console for AWS Amplify](https://console.aws.amazon.com/amplify/home).

-   Select _New app_, then _Host web app_.

-   In the _Get started with Amplify Hosting_ page, select _AWS CodeCommit_, then select _Continue_.

-   Select the AWS CodeCommit repository you created earlier (`aws-healthscribe-demo`), and verify that the branch name is correct (`main`). Select _Next_.

-   Feel free to change the app name on the _Build settings_ screen.

-   In the _Environment_ dropdown, select _Create new environment_.

-   In the _Service Role_ dropdown, select an existing role if have an existing service role for Amplify. Otherwise select the _Create new role_ button and follow the prompts. After creating the new IAM role, select the refresh button next to the dropdown and select your newly created IAM role.

-   Verify `amplify.yml` is detected in the _Build and test settings_ section.

-   Review the app settings, and select _Save and deploy_

-   If a build fails, you can review the logs from the AWS Amplify console. You can also attempt a rebuild by selecting the failed build, then selecting the _Redeploy this version_ button.

_Note:_ if the error says Amplify app ID not found, modify the build service IAM role to include the _AdministratorAccess-Amplify_ AWS-managed policy. You can find the build service IAM role by selecting _General_ in the Amplify app console.

-   The web app URL is named `https://<backend env name>.<app id>.amplifyapp.com` and can be found in the **Hosting environments** tab
