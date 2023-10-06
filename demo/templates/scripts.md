[//]: # (title="Adding Scripts")
[//]: # (scheme="dark")

[//]: # (template="shared")

<div class="content">

# Adding Scripts

Adding a script to a template is as easy as creating a scripts in your script directory that starts with the name of the template. For example, if you have a template called `home`, you can add a script called `home-script.js` to your script directory. This script will be loaded when the `home` template is loaded. You can include multiple scripts by either adding multiple `home{something?}.js` scripts or by adding a `home{something?}` directory where you can add multiple scripts that will be loaded.

In this instance we have a script called scripts-hello.js that logs hello to the console. This script is loaded when the `scripts` template is loaded.

Scripts can also be added to the `global` template. These scripts will be loaded on every page.

</div>
