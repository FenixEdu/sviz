---
layout: default
title: Internationalization - FenixEdu™ SViz
---

<h3>Internationalization</h3>
<p class="help-block" style="margin-bottom: 20px">
The visualizations provided by this library have some static text that you can change and internationalize depending on the end-user's locale.
To support the Portuguese language, you should create a folder <code>locales/pt/</code> and set the corresponding <code>translation.json</code> file:
</p>

{% highlight json %}
{
	"positive-grades": "Avaliações Positivas",
	"negative-grades": "Avaliações Negativas"
}
{% endhighlight %}

Then, the HTML element that should have the text must have the attribute <code>data-i18n</code>, like in the following example:
{% highlight html %}
<span data-i18n="positive-grades"></span>
{% endhighlight %}

To force a particular language, you should initialize SViz with the correspoding language:

{% highlight javascript %}
//set the language to Portuguese Language
SViz.init({ lang: "pt" });
{% endhighlight %}