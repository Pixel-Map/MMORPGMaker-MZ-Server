[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/tg9413/paper-dropdown-menu-multi)

# paper-dropdown-menu-multi
Multiselect with paper-dropdown-menu, based on polymer 2.0
## Installation
```
bower install paper-dropdown-menu-multi
```
## Usage
<!--
```
<custom-element-demo>
  <template>
		<base href="https://raw-dot-custom-elements.appspot.com/tg9413/paper-dropdown-menu-multi/0.1.0/paper-dropdown-menu-multi/">
		<style>
			:host{
				height:200px
			}
		</style>
		<script src="../webcomponentsjs/webcomponents-lite.js"></script>
		<link rel="import" href="paper-dropdown-menu-multi.html">
		<paper-dropdown-menu-multi label="Names" selections='["Sarah","Tessa","Hitaru"]' maxDisplay=3></paper-dropdown-menu-multi>
  </template>
</custom-element-demo>
```
-->
```html
<paper-dropdown-menu-multi label="some label" selections='[...array...]' maxDisplay=3 value="{{someVar}}"></paper-dropdown-menu-multi>
```
Output value will be in value attribute. I haven't test it with form yet.

## Credits
Google Polymer team. 
## License
MIT