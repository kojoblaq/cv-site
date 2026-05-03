import os

import click
from flask import current_app

from .extensions import db
from .models import Achievement, Experience, MediaItem, Profile, SiteSettings, Skill, User


def register_cli(app):
    @app.cli.command("init-db")
    def init_db():
        """Create database tables."""
        with app.app_context():
            db.create_all()
        click.echo("Database initialized.")

    @app.cli.command("seed")
    def seed():
        """Seed initial content (safe to re-run)."""
        with app.app_context():
            db.create_all()

            admin_email = os.environ.get("ADMIN_EMAIL", "admin@local").strip().lower()
            admin_password = os.environ.get("ADMIN_PASSWORD", "admin12345")

            user = db.session.query(User).filter_by(email=admin_email).first()
            if not user:
                user = User(email=admin_email)
                user.set_password(admin_password)
                db.session.add(user)

            profile = db.session.query(Profile).order_by(Profile.id.asc()).first()
            if not profile:
                profile = Profile(
                    full_name="Gerald Adjeman-Cofie",
                    headline="Graphic Designer · Video Editor · Social Media & Marketing Strategist",
                    location="Tema, Ghana",
                    phone="+233 555 299 010",
                    email="adjemancofiegerald@gmail.com",
                    linkedin_url="https://www.linkedin.com/in/gerald-adjeman-cofie-bb2307216",
                    summary=(
                        "Creative and results-driven multimedia professional with 5+ years of experience spanning graphic "
                        "design, video production, social media management, and digital marketing. Passionate about digital "
                        "design and art direction, solving problems through beautiful designs and experiences. Track record "
                        "of building brand identities, growing engaged communities, and delivering measurable ROI through "
                        "compelling visual storytelling."
                    ),
                )
                db.session.add(profile)

            settings = db.session.query(SiteSettings).order_by(SiteSettings.id.asc()).first()
            if not settings:
                settings = SiteSettings(primary_color="#84cc16", secondary_color="#6366f1")
                db.session.add(settings)

            if db.session.query(Experience).count() == 0:
                db.session.add(
                    Experience(
                        title="Graphic Designer & Social Media Manager",
                        company="One Voice Choir Ghana / BACE Africa / Houndle / MikeJobs",
                        location="Remote",
                        start="Dec 2022",
                        end="Present",
                        bullets="\n".join(
                            [
                                "Planned and executed social media strategies across Instagram, TikTok, Facebook and YouTube.",
                                "Produced, directed and edited short-form video content (Reels, TikToks, YouTube Shorts) achieving an average of 20K+ monthly views.",
                                "Managed paid campaigns (Meta Ads, Google Display) with limited monthly budgets, delivering an average ROAS of 4.2×.",
                                "Designed print and digital marketing materials including brochures, banners, pitch decks, and social media templates.",
                            ]
                        ),
                        sort_order=10,
                    )
                )
                db.session.add(
                    Experience(
                        title="Graphic Designer & Social Media Manager",
                        company="Valley View University Media Team",
                        location="Accra, Ghana",
                        start="Jan 2020",
                        end="Dec 2022",
                        bullets="",
                        sort_order=20,
                    )
                )
                db.session.add(
                    Experience(
                        title="Brand Influencer",
                        company="PharstCare / BetKing Ghana / EIB Qatar 2022",
                        location="Remote (X/Twitter)",
                        start="Sep 2022",
                        end="Mar 2024",
                        bullets="\n".join(
                            [
                                "Crafted engaging tweets, threads, and polls around brand niche; pinned key posts to maximize visibility.",
                                "Retweeted/quoted followers and collaborated with other influencers.",
                                "Addressed negative comments professionally and maintained brand tone.",
                            ]
                        ),
                        sort_order=30,
                    )
                )
                db.session.add(
                    Experience(
                        title="MDG Consultant (Africa)",
                        company="Wilmar Africa LTD",
                        location="",
                        start="Feb 2024",
                        end="Present",
                        bullets="\n".join(
                            [
                                "Ensured 99% data accuracy in material master records with AI-driven validation, reducing inconsistencies across regions.",
                                "Automated 85% of manual data governance tasks, streamlining SAP MDG workflows.",
                                "Supported predictive analytics improving supply chain forecasting accuracy by 30%.",
                            ]
                        ),
                        sort_order=40,
                    )
                )

            if db.session.query(Skill).count() == 0:
                db.session.add(
                    Skill(
                        category="Core Competencies",
                        items="\n".join(
                            [
                                "Brand Identity Design",
                                "Visual Storytelling",
                                "Analytics & Performance Reporting",
                                "Content Planning & Scheduling",
                                "Paid Social Advertising (Meta/TikTok)",
                            ]
                        ),
                        sort_order=10,
                    )
                )
                db.session.add(
                    Skill(
                        category="Tools (Design)",
                        items="Adobe Photoshop\nIllustrator\nInDesign\nXD\nFigma\nCanva Pro",
                        sort_order=20,
                    )
                )
                db.session.add(
                    Skill(
                        category="Tools (Video)",
                        items="Adobe Premiere Pro\nDaVinci Resolve\nCapCut",
                        sort_order=30,
                    )
                )
                db.session.add(
                    Skill(
                        category="Marketing / Analytics",
                        items="Meta Business Suite\nGoogle Analytics 4\nMeta Ads Manager\nTikTok Analytics\nYouTube Studio",
                        sort_order=40,
                    )
                )

            if db.session.query(Achievement).count() == 0:
                db.session.add(
                    Achievement(
                        text="Spearheaded an X (Twitter) campaign for PharstCare during a new package launch, trending at No. 1.",
                        sort_order=10,
                    )
                )
                db.session.add(
                    Achievement(
                        text="Led publicity + production for a concert fused with a live podcast session for the choir’s 20th anniversary.",
                        sort_order=20,
                    )
                )
                db.session.add(
                    Achievement(
                        text="Directed and produced a high-quality choir music video with limited resources.",
                        sort_order=30,
                    )
                )
                db.session.add(
                    Achievement(
                        text="Reduced content production costs by 22% by building an in-house asset library and template system.",
                        sort_order=40,
                    )
                )

            db.session.commit()
        click.echo("Seed complete.")

