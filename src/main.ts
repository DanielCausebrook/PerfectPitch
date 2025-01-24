import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import "@fontsource/iosevka-etoile/600.css";

const app = mount(App, {
  target: document.getElementById('app')!,
})


export default app

