from django.db import models
from django.contrib.auth.models import User
from django.db.models import Index

class Product(models.Model):
    name = models.CharField(max_length=255, db_index=True)  # Indexed for faster search
    url = models.URLField(unique=True)
    category = models.CharField(max_length=100, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        indexes = [
            Index(fields=['name']),
            Index(fields=['category'])
        ]

    def __str__(self):
        return self.name

class PriceHistory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="price_history")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    date_checked = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_checked']  # Show latest price first

class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    favorite_categories = models.JSONField()  # Store category preferences
    price_alerts = models.ManyToManyField(Product, blank=True)  # Notify user when price drops

    def __str__(self):
        return f"{self.user.username}'s Preferences"
