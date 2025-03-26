from celery import shared_task
from .models import Product, PriceHistory
import requests
from bs4 import BeautifulSoup
import logging

# Set up logging
logger = logging.getLogger(__name__)

@shared_task
def update_product_prices():
    """Fetch and update product prices from e-commerce websites"""
    for product in Product.objects.all():
        price = fetch_price(product.url)  # Get real price using web scraping
        if price:  # Only save if a valid price is found
            PriceHistory.objects.create(product=product, price=price)
            logger.info(f"Updated price for {product.name}: {price}")
        else:
            logger.warning(f"Failed to fetch price for {product.url}")

def fetch_price(url):
    """Scrapes and extracts price from an e-commerce website"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Raise error if status code is not 200
        
        soup = BeautifulSoup(response.text, 'html.parser')

        # Handling different e-commerce sites (Modify for your use case)
        if "amazon" in url:
            price_tag = soup.select_one("span.a-price-whole")  # Amazon selector
        elif "flipkart" in url:
            price_tag = soup.select_one("div._30jeq3")  # Flipkart selector
        else:
            price_tag = soup.find('span', class_='price')  # Default selector

        if price_tag:
            return float(price_tag.text.strip().replace("₹", "").replace("$", "").replace(",", ""))  # Convert to float
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error fetching price for {url}: {e}")
    except Exception as e:
        logger.error(f"Unexpected error fetching price for {url}: {e}")

    return None  # Return None if scraping fails

