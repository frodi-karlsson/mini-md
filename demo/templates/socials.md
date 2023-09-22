[//]: # (title: Social links)

[//]: # (template="shared")


# Social links
There is a number of ways to do social links on websites.
The easiest way is just to define a style matching images that have alt texts that start with `social image: ` or something similar.

Here is a snippet:
```markdown
![social image: alt text](/assets/socials/replit.png)
[My Repl.it profile](https://replit.com/@niranjansenthil)
```
Note the `social image` part in the first line. This is needed for styling the image properly. Whatever comes after social image in the alt text should be a clear description of the social media platform. This is needed for accessibility methods such as screen readers.

Here it is in action:

![social image: alt text](/assets/socials/github.png)
[Check out my Github!](https://github.com/frodi-karlsson)

You could however also write html for them:
```html
<a href="https://github.com/frodi-karlsson">
  <img src="/assets/socials/github.png" alt="social image: Github">
  Check out my Github!
</a>
```
<a href="https://github.com/frodi-karlsson">
  <img src="/assets/socials/github.png" alt="social image: Github">
  Check out my Github!
</a>

For convenience I've used the same styling trick.
