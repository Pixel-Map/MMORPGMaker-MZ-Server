(function(root){var fx=function(obj){return new fxWrapper(obj)};fx.version="0.2";var fxSetup=root.fxSetup||{rates:{},base:""};fx.rates=fxSetup.rates;fx.base=fxSetup.base;fx.settings={from:fxSetup.from||fx.base,to:fxSetup.to||fx.base};var convert=fx.convert=function(val,opts){if("object"===babelHelpers.typeof(val)&&val.length){for(var i=0;i<val.length;i++){val[i]=convert(val[i],opts)}return val}opts=opts||{};if(!opts.from)opts.from=fx.settings.from;if(!opts.to)opts.to=fx.settings.to;return val*getRate(opts.to,opts.from)},getRate=function(to,from){var rates=fx.rates;rates[fx.base]=1;if(!rates[to]||!rates[from])throw"fx error";if(from===fx.base){return rates[to]}if(to===fx.base){return 1/rates[from]}return rates[to]*(1/rates[from])},fxWrapper=function(val){if("string"===typeof val){this._v=parseFloat(val.replace(/[^0-9-.]/g,""));this._fx=val.replace(/([^A-Za-z])/g,"")}else{this._v=val}},fxProto=fx.prototype=fxWrapper.prototype;fxProto.convert=function(){var args=Array.prototype.slice.call(arguments);args.unshift(this._v);return convert.apply(fx,args)};fxProto.from=function(currency){var wrapped=fx(convert(this._v,{from:currency,to:fx.base}));wrapped._fx=fx.base;return wrapped};fxProto.to=function(currency){return convert(this._v,{from:this._fx?this._fx:fx.settings.from,to:currency})};if("undefined"!==typeof exports){if("undefined"!==typeof module&&module.exports){exports=module.exports=fx}exports.fx=fx}else if("function"===typeof define&&define.amd){define([],function(){return fx})}else{fx.noConflict=function(previousFx){return function(){root.fx=previousFx;fx.noConflict=void 0;return fx}}(root.fx);root.fx=fx}})(this);