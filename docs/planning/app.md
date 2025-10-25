App
    - / (index)
        - Description: Homepage. This is the rooth route of the Linebasis app. It will have a generic Linebasis default. User will be able to define the homepage directly from the designer or from the /designers page.
    
    - /register
    
    - /admin (auth)
        - Navbar
            - Linebasis brandmark
            - Page title
            - Link: site homepage
        - Sidebar navigation
            - Pages list
                - link: home (/index)
                - link: pages
                - link: themes
                - link: blog
                - link: media library
                - link: plugins
                - link: settings
                - link: username (/{username})
        - Alert toast
            - Error message
            - Accept incomming theme
                - By {author_username}
                - Button: accept
                - Button: reject
        - Link: Logout
        - Footer
            - Made with Linebasis
            - link: www.linebasis.org

        /designer/{page_title}
            - view page-builder-spec.md

        - /index 
            - Button: new page
            - Button: new post
            - Latest activity list
                - Activity item
                    - Type (Created/Edited/Deleted)
                    - Title (Page title, Post title, Member name, etc)
                    - Time stamp

        - /settings
            - Input: site name
            - Button: save changes
            - Domain stuff
            - more TBD
            - AI API key (for future AI features)
    
        - /pages
            - Button: create new page (opens a new page builder (designer) canvas)
            - Link: export as theme (this allows a user to send the pages to another website or download as zip)
            - Pages list
                - Page item
                    - Description: a Linebasis page is a design file
                    - Published pages list
                        - Page item: page title
                    - Page URL
                    - Created time stamp
                    - Last edition time stamp
                    - Created by 
                    - Last edited by
                    - Actions
                        - Link: edit (redirect)
                        - Button: copy page URL
                        - Button: delete
                        - Define as homepage
                        - Create template (Allows user to select a template that this page will be used as. Templates are pages for the blog (arcticle page, blog page, history page, etc)).

        - /blog 
            - button: new post
            - posts list
                - Post item
                    - Post actions tbd

            /writter
                - a page to write/edit a post using rich text in a Notion like experience. These posts are going to be displayed where the Post component was inserted in the template page design.

        - /components    
            - Components list
                - Default components: all blog components
                - Component item selector
                - Link: edit component (goes to /pages{page})
            - Component view
            - Actions

        - /themes
            - Description: basically, themes allow website pages, components and tokens to be transfered from one Linebasis site to another. Usefull for community, freelancers, client work. 
            - Link: import theme
            - Themes list
                - Theme item
                    - Theme title
                    - Actions
                        - Download .zip
                        - Edit 
                        - Delete
            
            - /import
                - file input: drop/browse theme file
                - API section
                    - API keys list
                        - API key item
                            - API key
                            - Button: delete
                            - Button: copy string
                    - Button: generate new key
            
            - /export (export site as a theme)
                - button: download
                - input: API key
    

        - /plugins 
            - tbd
    
        - /team
            - Team members list
                - Member item
                    - Thumbnail
                    - Input: team member name
                    - Input: team member email
                    - Dropdown: team member role
                        - Owner (Can't be removed)
                        - Manager (can do everything, including adding/removing members and defining roles)
                        - Designer (can create/edit/delete pages/themes/posts)
                        - Editor (can edit page content/posts)
                    - Delete team member
            - Button: Add new member
                - Invitation link
                    - Copy
            - Button: Save team changes

        -/{username}
            - Input: user name
            - Input: user email
            - User profile picture
            - Button: save changes

    