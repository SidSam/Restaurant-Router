# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-01-08 05:45
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('routeyourfood', '0005_auto_20180108_1007'),
    ]

    operations = [
        migrations.AlterField(
            model_name='restaurant',
            name='place_id',
            field=models.CharField(max_length=50, unique=True),
        ),
    ]