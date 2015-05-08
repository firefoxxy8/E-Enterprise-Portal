// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/3.11/esri/copyright.txt for details.
//>>built
(function(f,a){"function"===typeof define&&define.amd?define("esri/workers/heatmapCalculator",[],a):f.HeatmapCalculator=a();if(f.importScripts&&"function"===typeof f.importScripts){var g;f.addEventListener("message",function(a){var b=a.data,d=b.action;a=b.msgId;d&&a&&("initialize"==d?(g=new f.HeatmapCalculator(b),postMessage({msgId:a})):"calculate"==d&&(b=g.calculateImageData(b),postMessage({msgId:a,imageData:b},b)))},!1)}})(this,function(){function f(a){this.radius=a.blurRadius||10;this.maxVal=a.maxPixelIntensity;
this.minVal=a.minPixelIntensity;this.field=a.field;this.width=a.width;this.height=a.height;if(a=a.gradient)this.gradient=a.buffer?new Uint32Array(a.buffer):a instanceof ArrayBuffer?new Uint32Array(a):void 0}f.prototype.calculateImageData=function(a){var g=this.radius=a.blurRadius||this.blurRadius;this.maxVal=null!=a.maxPixelIntensity?a.maxPixelIntensity:this.maxPixelIntensity;this.minVal=null!=a.minPixelIntensity?a.minPixelIntensity:this.minPixelIntensity;var m=this.field="field"in a?a.field:this.field,
b=a.screenPoints,d=a.gradient;if(d)d=this.gradient=d.buffer?new Uint32Array(d.buffer):d instanceof ArrayBuffer?new Uint32Array(d):void 0;else if(this.gradient)d=this.gradient;else return!1;var c=a.features,e=a.mapinfo;b||(c&&e?b=this.screenPoints=this._calculateScreenPoints(c,e):!e&&this.screenPoints&&(c=!0,a.width&&a.width!=this.width&&(c=!1,this.width=a.width),a.height&&a.height!=this.height&&(c=!1,this.height=a.height),c?b=this.screenPoints:this.screenPoints=null));if(!b)return!1;c=e.width||a.width||
this.width;a=e.height||a.height||this.height;g=this._calculateIntensityMatrix(b,c,a,g,m);return this._createImageData(c,a,g,d)};f.prototype._calculateScreenPoints=function(a,g){var m=g.resolution,b=g.width,d=g.height,c=g.extent,e=[];if(c)m||(m=d?Math.abs(c[3]-c[1])/d:Math.abs(c[2]-c[0])/b);else return!1;b=0;for(d=a.length;b<d;b++){var h=a[b];e[b]={x:Math.round((h.geometry.x-c[0])/m),y:Math.round((c[3]-h.geometry.y)/m),attributes:h.attributes}}return e};f.prototype._calculateIntensityMatrix=function(a,
g,m,b,d){for(var c=Array(m),e=0;e<m;e++)for(var h=c[e]=Array(g),l=0;l<g;l++)h[l]=0;for(var e=Math.round(4.5*b),k=b*b,h=[],f=2*e+1,l=-1,q=1;++l<f;)h[l]=Math.exp(-Math.pow(l-e,2)/(2*k))/Math.sqrt(2*Math.PI)*(b/2);for(l=0;l<a.length;l++){var n=a[l];b=n.x-e;var k=n.y-e,f=b,r=k;d&&(q=n.attributes[d]);for(var s=Math.min(n.y+e,m-1),n=Math.min(n.x+e,g-1);k<=s;){for(var t=h[k-r];b<=n;)-1<b&&-1<k&&(c[k][b]+=t*h[b-f]*q),b++;k++;b=f}}return c};f.prototype._createImageData=function(a,g,f,b){for(var d=new Uint32Array(a*
g),c=this.minVal,e=b.length/(this.maxVal-c),h=0;h<g;h++)for(var l=f[h],k=0;k<a;k++){var p=Math.floor((l[k]-c)*e);d[h*a+k]=0>p?b[0]:p<b.length?b[p]:b[b.length-1]}return d.buffer};return f});