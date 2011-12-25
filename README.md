Playing around with the [knockout contacts editor example](http://knockoutjs.com/examples/contactsEditor.html)

- I use haml for templating engine
- Note that as haml doesn't seem to support 'includes', I use render_file.rb to accomplish this. 
- In this example I try to make things as simple as possible while using the tools I like such as coffee-script and haml
- Runs without an app server
- build.sh compiles the coffee-script and haml sources
- In my web server I point it to the public directory
