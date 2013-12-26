---
layout: default
title: Internationalization - FenixEdu™ SViz
---

<h3>Internationalization</h3>
<p class="help-block" style="margin-bottom: 20px">
The visualizations provided by this library have some static text that you can change and internationalize depending on the end-user's locale. SViz currently supports English (<code>'en'</code>) and Portuguese (<code>'pt'</code>).<br/>
To support another language, you should create a folder <code>locales/[language-abbrv]/</code> and create the corresponding <code>translation.json</code> file. Use the Portuguese or English file as sample by copying and translating its contents.<br/>
The files are structured as follows:
</p>

{% highlight json %}
{
	"visualization1": {
		"text_1_id": "Translated Text 1",
		"text_2_id": "Translated Text 2",
		...
	},
	...
}
{% endhighlight %}
change only the "Translated Texts".


To force a particular language (the default is <code>'en'</code>), you should initialize SViz with the correspoding language:

{% highlight javascript %}
//set the language to Portuguese
SViz.init({ lang: "pt" });
{% endhighlight %}
The <code>init</code> function can be called multiple times (e.g. whenever the user sets his language).