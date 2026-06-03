"""
AdAstra Sky - Database Seeding Script (v1, legacy)
This script is deprecated. Use seed_bortle_v2.py or database/seed.js instead.

Usage:
    node database/seed.js       # Recommended - uses Sequelize models
    python database/seed_bortle_v2.py  # Alternative - uses psycopg2
"""
import logging
logging.warning("seed_bortle.py is deprecated. Use database/seed.js or seed_bortle_v2.py")
logging.warning("  node database/seed.js")
logging.warning("  python database/seed_bortle_v2.py")

if __name__ == "__main__":
    print("seed_bortle.py is deprecated. Use:")
    print("  node database/seed.js")
    print("  python database/seed_bortle_v2.py")