from django.contrib import admin
from api.models import Company,Employee

# Register your models here.
class CompanyAdmin(admin.ModelAdmin):
    list_display=('name','locations','type')

admin.site.register(Company,CompanyAdmin)
admin.site.register(Employee)