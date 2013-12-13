---
layout: default
title: Visualizations - FenixEdu™ SViz
---

<h3>Visualizations</h3>
<p class="help-block" style="margin-bottom: 20px">
This visualization provides a quick insight about all the student courses, showing him both the percentages of positive and negative grades.
</p>

<div class="row">
  {% for item in site.visualizations %}
  <a href="{{ site.baseurl }}/visualizations/{{ item.path }}">
    <div class="col-sm-6 col-md-3">
      <div class="thumbnail">
        <div class="caption" style="padding: 0px 9px">
          <h4>{{ item.name }}</h4>
        </div>
        <img class="img-responsive img-thumbnail" src="{{ site.baseurl }}/visualizations/{{ item.path }}/thumbnail.png" alt="{{ item.name }} Visualization">
      </div>
    </div>
  </a>
  {% endfor %}
</div>
