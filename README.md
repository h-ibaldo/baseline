# What it Baseline?

An open source project with huge ambition and expectations. The goal of this project is to fill a gap in the market of webdesign ecosystems replacing Wordpress, Figma (for web) and tools like Webflow. The ssuccess metric is to power 20% of the web in 5 years.

## The problems we’re trying to solve:

1. Wordpress allows full customization and you own the code. It’s not platform dependent. But offers a poor and extremely outdated DX and UX and technology.

2. Figma is private sector. It’s the best design experience (but still can be highly improved). Dynamic UX. However, you don’t design directly with web components. A div is not a div. As a result, only complicated and stressful layers of abstraction are offered to link the gap between design to code.

3. Webflow and similars are private sector. They allow you to design with the actual code of your website. But you have to pay high fees. You cannot change much of the tool itself. 

## How to solve this:

Design Exp. clean, light, dynamic (multiple artboards), you design with the actual code of your actual page. Designer focused. Allows you to design a visual identity for the website with variables and components, templates and themes. Allows you to design based on a baseline. Aligns text to baseline like InDesign, appealing to demanding Graphic Designers. Built in animation system in the future.

You own the code and your platform. Developers or curious designers can change anything. Incentive to build plugins (must have plugin system), themes and libraries.

100% free and open-source. Don’t accept contributions in the beginning. Might offer paid hosted options in the future.

****************

# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
