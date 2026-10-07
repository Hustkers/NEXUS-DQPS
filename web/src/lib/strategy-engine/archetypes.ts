export interface StrategicArchetype {
  code: string;
  name: string;
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU' | 'RETENTION';
  platformDefault: 'meta' | 'google' | 'amazon' | 'tiktok';
  adFormat: string;
  creativeAngle: string;
  messagingAngle: string;
  targetingMethod: string;
  audienceSegment: string;
  biddingStrategy: string;
  retargetingType: string;
  demographicTargeting: string;
  timingStrategy: string;
  offerStrategy: string;
  keywordInterestTargeting: string;
  baseCtr: number;
  baseCpcRatio: number;
  baseCvr: number;
  baseRisk: number;
  baseConfidence: number;
  budgetShare: number;
  advantages: string[];
  disadvantages: string[];
  assumptions: string[];
}

export const STRATEGIC_ARCHETYPES: StrategicArchetype[] = [
  {
    code: 'ARCH-01',
    name: 'High-Intent Exact Search Acquisition',
    funnelStage: 'BOFU',
    platformDefault: 'google',
    adFormat: 'Responsive Search Ads (RSA)',
    creativeAngle: 'Direct Problem-Solution & Technical Specifications',
    messagingAngle: 'Precision Match, Immediate In-Stock Availability & Fast Delivery',
    targetingMethod: 'Exact & Phrase Match High-Commercial Keywords',
    audienceSegment: 'Active In-Market High-Purchase-Intent Searchers',
    biddingStrategy: 'Target CPA (tCPA) with Conservative Bidding Caps',
    retargetingType: 'Acquisition (High Intent)',
    demographicTargeting: 'All demographics actively querying specific model terms',
    timingStrategy: 'Even Pacing with 20% Search Volume Surge (10 AM - 8 PM)',
    offerStrategy: 'Full Price In-Stock Showcase with Authentic Manufacturer Warranty',
    keywordInterestTargeting: 'Commercial intent keywords, model numbers, buy online terms',
    baseCtr: 0.038,
    baseCpcRatio: 1.25,
    baseCvr: 0.042,
    baseRisk: 24,
    baseConfidence: 0.92,
    budgetShare: 0.12,
    advantages: [
      'Captures users at the moment of peak purchase intent',
      'Consistently highest conversion rates across search channels',
      'Minimal ad creative fatigue compared to visual platforms'
    ],
    disadvantages: [
      'Higher cost-per-click due to competitive auction bidding',
      'Search volume upper bound limits pure horizontal scaling'
    ],
    assumptions: [
      'Sufficient search query volume exists for the product/service category',
      'Landing page provides friction-free instant checkout'
    ]
  },
  {
    code: 'ARCH-02',
    name: 'Meta Advantage+ Dynamic Catalog Retargeting',
    funnelStage: 'RETENTION',
    platformDefault: 'meta',
    adFormat: 'Dynamic Carousel Catalog Ads',
    creativeAngle: 'Personalized Product Recall with Dynamic Pricing',
    messagingAngle: 'Items Waiting in Cart • Free Shipping Threshold Reminder',
    targetingMethod: 'Pixel-Based 7-Day Viewed Product & Abandoned Cart Audience',
    audienceSegment: 'Warm Visitors (Visited PDP or Added to Cart in last 14 days)',
    biddingStrategy: 'Lowest Cost with Target ROAS Floor Guardrail',
    retargetingType: 'Retargeting (Warm Cart Abandoners)',
    demographicTargeting: 'Engaged past website visitors aged 18-55',
    timingStrategy: 'Continuous 24/7 Delivery with Frequency Capping (max 3/day)',
    offerStrategy: 'Limited-Time Complimentary Shipping or 10% Welcome Perk',
    keywordInterestTargeting: 'Website Custom Audience + Catalog Feed Synchronization',
    baseCtr: 0.026,
    baseCpcRatio: 0.85,
    baseCvr: 0.058,
    baseRisk: 20,
    baseConfidence: 0.9,
    budgetShare: 0.08,
    advantages: [
      'Superb conversion rates on high-intent warm traffic',
      'Automated product recommendation engine matches visitor interest',
      'Low acquisition cost per recovered cart'
    ],
    disadvantages: [
      'Audience size bounded strictly by site traffic volume',
      'High frequency risks ad fatigue if retargeting window is too wide'
    ],
    assumptions: [
      'Meta Pixel / Conversions API tracking active with catalog feed mapped',
      'Site generates at least 500 unique product views weekly'
    ]
  },
  {
    code: 'ARCH-03',
    name: 'TikTok Creator UGC Social Discovery',
    funnelStage: 'TOFU',
    platformDefault: 'tiktok',
    adFormat: '9:16 Vertical Video Spark Ads',
    creativeAngle: 'First-Person Native Unboxing & Authentic Problem Review',
    messagingAngle: "'The one product I didn't know I needed' viral testimonial hook",
    targetingMethod: 'Interest & Behavioral Targeting + Video Interaction Custom Audience',
    audienceSegment: 'Gen Z & Millennial Trendsetters, Lifestyle & Category Enthusiasts',
    biddingStrategy: 'Cost Cap with Maximum Delivery Pacing',
    retargetingType: 'Cold Acquisition (Viral Social)',
    demographicTargeting: 'Ages 18-34, Mobile-first lifestyle & urban creators',
    timingStrategy: 'Heavy Peak Evening Delivery (5 PM - Midnight)',
    offerStrategy: 'Influencer Creator Coupon Code (15% Off)',
    keywordInterestTargeting: '#SneakerTok, #FitnessMotivation, #StyleInspo, #RunningCommunity',
    baseCtr: 0.016,
    baseCpcRatio: 0.55,
    baseCvr: 0.019,
    baseRisk: 52,
    baseConfidence: 0.72,
    budgetShare: 0.07,
    advantages: [
      'Massive viral reach potential with lowest CPM across platforms',
      'Authentic social proof builds rapid emotional connection',
      'Generates valuable UGC creative assets for multi-channel reuse'
    ],
    disadvantages: [
      'High creative fatigue rate requiring weekly video refreshes',
      'Lower purchase intent on initial impression compared to search'
    ],
    assumptions: [
      'Engaging 15-second creator vertical video assets are produced',
      'Product has visual novelty or clear demonstrable utility'
    ]
  },
  {
    code: 'ARCH-04',
    name: 'Amazon Sponsored Products Competitor Conquesting',
    funnelStage: 'BOFU',
    platformDefault: 'amazon',
    adFormat: 'Sponsored Products ASIN Product Placement',
    creativeAngle: 'Direct Comparison Value Proposition on Rival Product Detail Pages',
    messagingAngle: 'Superior Specs, Higher Rating & Better Value Alternative',
    targetingMethod: 'Product / ASIN Targeting on Top 5 Rival Benchmark Products',
    audienceSegment: 'Shoppers viewing rival brand listings on Amazon',
    biddingStrategy: 'Dynamic Bids - Up and Down with Buy Box Protection',
    retargetingType: 'Acquisition (Competitor Intercept)',
    demographicTargeting: 'Amazon Prime active buyers in footwear & apparel',
    timingStrategy: 'Continuous 24/7 Bidding synchronized with Buy Box status',
    offerStrategy: 'Instant Amazon Coupon Badge (5-10% Clippable Discount)',
    keywordInterestTargeting: 'Rival brand ASINs, category leader model names, alternative queries',
    baseCtr: 0.019,
    baseCpcRatio: 1.15,
    baseCvr: 0.065,
    baseRisk: 38,
    baseConfidence: 0.85,
    budgetShare: 0.09,
    advantages: [
      'Intercepts qualified buyers right on competitor checkout points',
      'Very high purchase readiness inside the Amazon marketplace',
      'Visible star ratings and Prime badge increase instant trust'
    ],
    disadvantages: [
      'Competitor bidding wars can cause CPC volatility',
      'Requires active stock and Buy Box ownership at all times'
    ],
    assumptions: [
      'Product has competitive ratings (>= 4.2 stars) and reliable inventory',
      'Seller has active Buy Box eligibility'
    ]
  },
  {
    code: 'ARCH-05',
    name: 'Google Performance Max (PMax) Omnichannel Scale',
    funnelStage: 'BOFU',
    platformDefault: 'google',
    adFormat: 'PMax Multi-Asset Group (Search + Shopping + YouTube + Maps)',
    creativeAngle: 'Full-Funnel Omnichannel Asset Blend with Dynamic Creative',
    messagingAngle: 'Official Store Guarantee • Free Express Delivery & Easy Returns',
    targetingMethod: 'Audience Signals (First-party customer list + High intent search queries)',
    audienceSegment: 'Algorithmic high-probability converters across Google properties',
    biddingStrategy: 'Target ROAS (tROAS) with Historical Conversion Value Anchor',
    retargetingType: 'Hybrid Acquisition & Re-engagement',
    demographicTargeting: 'Broad demographic auto-optimized by Google AI',
    timingStrategy: 'Machine Learning Automated Dayparting & Budget Pacing',
    offerStrategy: 'Free Express Delivery on orders over threshold',
    keywordInterestTargeting: 'Audience signals + Google Shopping Merchant Center feed',
    baseCtr: 0.024,
    baseCpcRatio: 0.95,
    baseCvr: 0.039,
    baseRisk: 28,
    baseConfidence: 0.88,
    budgetShare: 0.14,
    advantages: [
      'Accesses all Google ad inventories through a single algorithmic engine',
      'Continuously self-optimizes asset combinations for highest conversion value',
      'Strong multi-touch attribution coverage across search and display'
    ],
    disadvantages: [
      'Black-box placement distribution offers limited channel transparency',
      'Requires extensive asset library (images, videos, headlines, logos)'
    ],
    assumptions: [
      'Accurate conversion value tracking enabled in Google Ads',
      'Google Merchant Center feed active and approved'
    ]
  },
  {
    code: 'ARCH-06',
    name: 'Meta 1% Lookalike High-LTV Audience Expansion',
    funnelStage: 'MOFU',
    platformDefault: 'meta',
    adFormat: 'High-Definition Video Reels & Feed Carousel',
    creativeAngle: 'Aspirational Lifestyle Storytelling & Premium Product Craft',
    messagingAngle: "'Built for those who demand more' • Elite performance story",
    targetingMethod: '1% Lookalike Audience derived from Top 10% Repeat Purchasers',
    audienceSegment: 'High-Affinity Clones of Highest Lifetime Value Customers',
    biddingStrategy: 'Value Optimization (Highest Value Bidding)',
    retargetingType: 'Prospecting (Lookalike Modeling)',
    demographicTargeting: 'Ages 22-48, Urban Metros, Active Lifestyle Affinity',
    timingStrategy: 'Daytime & Evening Balanced Pacing with Weekend Bump (+15%)',
    offerStrategy: 'Complimentary Premium Gift with Purchase over target threshold',
    keywordInterestTargeting: '1% LTV Seed List + Running/Athletic Fitness Interests',
    baseCtr: 0.021,
    baseCpcRatio: 0.9,
    baseCvr: 0.028,
    baseRisk: 32,
    baseConfidence: 0.84,
    budgetShare: 0.1,
    advantages: [
      'Leverages first-party customer profile data for high-relevance cold reach',
      'Statistically proven higher average order value (AOV)',
      'Scalable audience size (1.5M - 3M qualified individuals)'
    ],
    disadvantages: [
      'Lookalike fidelity diminishes if first-party seed list is under 1,000 users',
      'Higher creative production cost for premium video reels'
    ],
    assumptions: [
      'First-party customer purchase history available for seed modeling',
      'Creative aligns with aspirational brand aesthetic'
    ]
  },
  {
    code: 'ARCH-07',
    name: 'Amazon Sponsored Brands Video Showcase',
    funnelStage: 'MOFU',
    platformDefault: 'amazon',
    adFormat: 'Sponsored Brands Video (In-Search Autoplay 16:9)',
    creativeAngle: 'Hero Product Engineering & Material Technology in Motion',
    messagingAngle: 'See the Difference: Responsive Cushioning & Lightweight Build',
    targetingMethod: 'Category Search Keyword Placement + Brand Store Destination',
    audienceSegment: 'Shoppers actively searching category terms on Amazon',
    biddingStrategy: 'Rule-Based Dynamic Bids with Top of Search Multiplier',
    retargetingType: 'Category Acquisition',
    demographicTargeting: 'Prime shoppers looking for premium footwear & gear',
    timingStrategy: 'Daytime Active Search Hours (8 AM - 10 PM)',
    offerStrategy: 'Brand Store Feature Showcase with Multi-SKU Exploration',
    keywordInterestTargeting: "Generic category search terms: 'running shoes men', 'cushioned sneakers'",
    baseCtr: 0.027,
    baseCpcRatio: 1.1,
    baseCvr: 0.048,
    baseRisk: 30,
    baseConfidence: 0.86,
    budgetShare: 0.08,
    advantages: [
      'Dominates search results page with high-impact autoplay video tile',
      'Significantly higher CTR than static sponsored products',
      'Drives qualified traffic to brand store for multi-item baskets'
    ],
    disadvantages: [
      'Higher video production barrier and strict Amazon compliance review',
      'High CPC on top category keywords'
    ],
    assumptions: [
      'Registered brand on Amazon with storefront configured',
      'Crisp 15-30 second silent-friendly product video ready'
    ]
  },
  {
    code: 'ARCH-08',
    name: 'Omnichannel Urgency Flash Drop Countdown',
    funnelStage: 'BOFU',
    platformDefault: 'meta',
    adFormat: 'Urgency Stories & Reels with Animated Countdown Sticker',
    creativeAngle: 'Extreme Scarcity & Limited 48-Hour Availability',
    messagingAngle: "48 Hours Only: Flash Allocation Dropped • When It's Gone, It's Gone",
    targetingMethod: 'Combined Warm Engagement + Broad Re-targeting (Past 30 Days)',
    audienceSegment: 'Engaged Social Followers + Newsletter Warm Base + Cart Abandoners',
    biddingStrategy: 'Accelerated Pacing with Maximum Conversion Bidding',
    retargetingType: 'Warm Blitz Retargeting',
    demographicTargeting: 'All past 90-day brand engagers aged 18-50',
    timingStrategy: 'Compressed 48-72 Hour Burst with Hourly Budget Escalation',
    offerStrategy: 'Exclusive Tiered Flash Discount (Buy 1 Get 10%, Buy 2 Get 25%)',
    keywordInterestTargeting: 'Custom engagement audience + VIP loyalty segment',
    baseCtr: 0.034,
    baseCpcRatio: 0.8,
    baseCvr: 0.052,
    baseRisk: 35,
    baseConfidence: 0.89,
    budgetShare: 0.06,
    advantages: [
      'Psychological urgency generates massive short-term conversion spikes',
      'Rapidly liquidates seasonal inventory or launches new hero models',
      'High viral shareability among friends and deal forums'
    ],
    disadvantages: [
      'Not sustainable over long campaign durations (urgency loses credibility)',
      'May compress gross margin percentage due to discount incentive'
    ],
    assumptions: [
      'Real inventory allocation exists to fulfill sudden order rush',
      'Strict end date enforced to maintain future offer authority'
    ]
  },
  {
    code: 'ARCH-09',
    name: 'TikTok Spark Ads Influencer Co-Branded Push',
    funnelStage: 'MOFU',
    platformDefault: 'tiktok',
    adFormat: 'Spark Ads (Boosted Organic Creator Posts)',
    creativeAngle: "Creator Lifestyle Integration & 'Real Day in My Shoes'",
    messagingAngle: "'Here is why I swapped my daily runners for these' • Genuine endorsement",
    targetingMethod: 'Creator Engagement Lookalikes & Lifestyle Interest Clusters',
    audienceSegment: 'Athletic lifestyle followers and fitness micro-communities',
    biddingStrategy: 'Target Cost Cap with Standard Pacing',
    retargetingType: 'Influencer Amplification',
    demographicTargeting: 'Ages 18-35 interested in marathon, fitness, streetwear',
    timingStrategy: 'Even distribution across weekday evenings and weekends',
    offerStrategy: 'Creator exclusive bundle code + early-access colorways',
    keywordInterestTargeting: 'Fitness, Running, Streetwear, Lifestyle, Sneakerheads',
    baseCtr: 0.022,
    baseCpcRatio: 0.65,
    baseCvr: 0.024,
    baseRisk: 44,
    baseConfidence: 0.76,
    budgetShare: 0.06,
    advantages: [
      "Leverages creator's genuine social capital and comments section",
      'Seamless native look prevents ad-blindness skip behavior',
      'Retains social engagement metrics (likes, shares, comments) on profile'
    ],
    disadvantages: [
      'Dependency on creator permissions and authorization codes',
      'Moderation overhead on viral comment threads'
    ],
    assumptions: [
      'Creator partnership established with Spark ad authorization code',
      'Video content complies with platform ad policies'
    ]
  },
  {
    code: 'ARCH-10',
    name: 'Google Shopping High-Margin SKU Smart Bidding',
    funnelStage: 'BOFU',
    platformDefault: 'google',
    adFormat: 'Google Merchant Shopping Product Listing Ads (PLA)',
    creativeAngle: 'Clean Product Imagery, Price Transparency & Google Customer Reviews',
    messagingAngle: 'Clear pricing, 4.8★ Rating, Free Shipping & 30-Day Trial Guarantee',
    targetingMethod: 'Custom Label Filter: High Gross Margin SKUs (>55% Margin)',
    audienceSegment: 'Direct product comparators seeking specific footwear models',
    biddingStrategy: 'Target ROAS with Profit Margin Tier Segmentation',
    retargetingType: 'Shopping Direct Intent',
    demographicTargeting: 'Commercial searchers across all target regions',
    timingStrategy: 'Full week dayparting weighted towards peak e-commerce hours',
    offerStrategy: 'Official Brand Pricing with Price-Match & Authenticity Promise',
    keywordInterestTargeting: 'Google Product Feed attributes + High margin SKU grouping',
    baseCtr: 0.029,
    baseCpcRatio: 0.9,
    baseCvr: 0.045,
    baseRisk: 22,
    baseConfidence: 0.91,
    budgetShare: 0.11,
    advantages: [
      'Protects profitability by bidding aggressively only on high-margin inventory',
      'High purchase intent from visual comparison shoppers',
      'Direct synchronization with warehouse stock levels prevents wasted clicks'
    ],
    disadvantages: [
      'Requires continuous catalog feed maintenance and Google review compliance',
      'Vulnerable to competitor price undercuts in the Shopping carousel'
    ],
    assumptions: [
      'Product catalog custom labels correctly categorize margin tiers',
      'Competitive price index relative to authorized retailers'
    ]
  },
  {
    code: 'ARCH-11',
    name: 'Metro Commuter Dayparted Geofencing Spike',
    funnelStage: 'MOFU',
    platformDefault: 'meta',
    adFormat: 'Mobile-Optimized Instagram Story & Feed Ads',
    creativeAngle: 'End-of-Workday Relief & Urban Commute Comfort',
    messagingAngle: 'Tired feet after a long workday? Step into ultimate responsive cushioning.',
    targetingMethod: 'Geofenced Tier-1 Tech & Corporate Hubs (Top Metros) + Dayparting',
    audienceSegment: 'Urban Professionals aged 24-42 commuting in major metropolitan clusters',
    biddingStrategy: 'Scheduled High Bidding (6 PM - 11 PM Monday-Thursday)',
    retargetingType: 'Contextual Geo-Acquisition',
    demographicTargeting: 'Tier-1 Metro corporate hubs, White-collar workers, High disposable income',
    timingStrategy: 'Heavy Dayparting: 70% budget concentrated between 6 PM and 11 PM',
    offerStrategy: 'Express Next-Day Metro Delivery Included',
    keywordInterestTargeting: 'Corporate professionals, commuting, marathon clubs, urban fitness',
    baseCtr: 0.023,
    baseCpcRatio: 0.88,
    baseCvr: 0.033,
    baseRisk: 34,
    baseConfidence: 0.82,
    budgetShare: 0.05,
    advantages: [
      'Pinpoint contextual relevance when users are actively feeling fatigue',
      'Eliminates wasted ad spend during dormant working hours',
      'High concentration of high-disposable-income urban customers'
    ],
    disadvantages: [
      'Geographic restriction limits total addressable audience size',
      'Requires automated scheduled dayparting scripts'
    ],
    assumptions: [
      'Fast fulfillment infrastructure available in targeted metropolitan areas',
      'Contextual messaging resonates with desk and commuting workforce'
    ]
  },
  {
    code: 'ARCH-12',
    name: 'Niche Athletic Subculture Community Blitz',
    funnelStage: 'MOFU',
    platformDefault: 'meta',
    adFormat: 'Technical Carousel & In-Depth Runner Testimonial',
    creativeAngle: 'Mile-Split Optimization, Cadence Analysis & Gait Support',
    messagingAngle: 'Engineered for Sub-4 Marathoners: Carbon Plates & Zero Fatigue Foam',
    targetingMethod: 'Niche Running Clubs, Strava Integration Communities & Race Finishers',
    audienceSegment: 'Hardcore Endurance Athletes, Marathon Runners, Triathlon Participants',
    biddingStrategy: 'Manual Bid Cap with High Value Audience Focus',
    retargetingType: 'Niche Affinity Prospecting',
    demographicTargeting: 'Ages 20-50, Marathon registrants, Endurance runners',
    timingStrategy: 'Early Morning (5 AM - 8 AM) and Weekend Long-Run Windows',
    offerStrategy: 'Pro-Athlete Training Guide Booklet with Every Purchase',
    keywordInterestTargeting: 'Marathon training, Strava, Ironman, Carbon plated shoes, Half marathon',
    baseCtr: 0.031,
    baseCpcRatio: 1.05,
    baseCvr: 0.036,
    baseRisk: 36,
    baseConfidence: 0.81,
    budgetShare: 0.05,
    advantages: [
      'Extremely high audience passion and organic peer-to-peer word-of-mouth',
      'Lower price sensitivity for performance-enhancing gear',
      'High repeat purchase rate for seasonal mileage replenishment'
    ],
    disadvantages: [
      'Strictly bounded audience size requires disciplined frequency control',
      'Community is hyper-critical: technical specs must be 100% accurate'
    ],
    assumptions: [
      'Product delivers genuine athletic performance benefits',
      'Copy uses authentic athletic terminology without corporate fluff'
    ]
  },
  {
    code: 'ARCH-13',
    name: 'VIP Customer Loyalty Tier & Early Access',
    funnelStage: 'RETENTION',
    platformDefault: 'meta',
    adFormat: 'Exclusive Custom Audience Dark Posts & Email Matched Ads',
    creativeAngle: 'Member Privilege, Unreleased Colorway Pre-Order & Status',
    messagingAngle: 'Exclusive Member Early Access: Secure Your Size Before General Release',
    targetingMethod: 'CRM Customer Match: 2+ Past Purchases or Top 20% Lifetime Value',
    audienceSegment: 'Verified Existing Brand Loyalists & Member Club Accounts',
    biddingStrategy: 'Lowest Cost with 100% Delivery Commitment',
    retargetingType: 'VIP Retention & Repeat Purchase',
    demographicTargeting: 'First-party hashed customer database (Phone & Email)',
    timingStrategy: 'Phased 7-Day Window before public product launch',
    offerStrategy: 'Early Access + 500 Loyalty Reward Points + Limited Edition Shoebag',
    keywordInterestTargeting: '1st-party CRM list match',
    baseCtr: 0.045,
    baseCpcRatio: 0.7,
    baseCvr: 0.082,
    baseRisk: 15,
    baseConfidence: 0.95,
    budgetShare: 0.05,
    advantages: [
      'Highest conversion rate and ROAS of any strategy in the portfolio',
      'Nurtures brand evangelism and customer lifetime value',
      'Immediate cash flow injection during pre-launch phase'
    ],
    disadvantages: [
      'Does not acquire new customers (strictly repeat monetization)',
      'Audience size strictly constrained by customer database size'
    ],
    assumptions: [
      'Customer CRM match rate on Meta is at least 65%',
      'Exclusive perk has genuine perceived value for existing buyers'
    ]
  },
  {
    code: 'ARCH-14',
    name: 'Broad Demographic Algorithmic Machine Learning',
    funnelStage: 'TOFU',
    platformDefault: 'meta',
    adFormat: 'Advantage+ Shopping Creative Grid (Static + Video + Carousel)',
    creativeAngle: 'Mass-Market Universal Appeal & Relatable Everyday Style',
    messagingAngle: 'The Everyday Shoe That Feels Like Walking on Clouds',
    targetingMethod: 'Completely Open Targeting (No interest or demographic restrictions)',
    audienceSegment: 'Broad National Population aged 18-65+, Algorithm-Discovered Buyers',
    biddingStrategy: 'Highest Volume with Automated Advantage+ Budget Allocation',
    retargetingType: 'Broad Algorithmic Prospecting',
    demographicTargeting: 'Open age 18-65+, National distribution',
    timingStrategy: '24/7 Algorithmic Pacing controlled by Meta Delivery Engine',
    offerStrategy: 'Universal Starter Offer: 10% Off First Pair with Email Signup',
    keywordInterestTargeting: 'None (Algorithmic creative-led targeting)',
    baseCtr: 0.017,
    baseCpcRatio: 0.75,
    baseCvr: 0.021,
    baseRisk: 40,
    baseConfidence: 0.78,
    budgetShare: 0.12,
    advantages: [
      'Maximum scaling runway with lowest CPM auction penalty',
      'Allows Meta AI to find unconventional buyer pockets humans overlook',
      'Creative acts as the targeting filter, self-sorting interested buyers'
    ],
    disadvantages: [
      'Requires higher initial learning budget for algorithmic calibration',
      'Initial conversion variance can be elevated during the first 3-5 days'
    ],
    assumptions: [
      'Conversions API configured with deduplicated event data',
      'At least 4 diverse creative variants supplied to feed the algorithm'
    ]
  },
  {
    code: 'ARCH-15',
    name: 'Complementary Category Cross-Sell Funnel',
    funnelStage: 'RETENTION',
    platformDefault: 'google',
    adFormat: 'Dynamic Remarketing Display & Discovery Ads',
    creativeAngle: 'Complete the Kit: Footwear + Performance Apparel Pairing',
    messagingAngle: 'Pair your new shoes with moisture-wicking socks & running gear',
    targetingMethod: 'Purchased Footwear in Last 30-90 Days, Excluded Recent Apparel Buyers',
    audienceSegment: 'Recent footwear buyers ready for accessories or seasonal replenishment',
    biddingStrategy: 'Target CPA with Modest Daily Budget Cap',
    retargetingType: 'Post-Purchase Cross-Sell',
    demographicTargeting: 'Verified recent customers',
    timingStrategy: 'Staggered 30-day post-delivery trigger',
    offerStrategy: 'Cross-sell bundle: 20% off socks & apparel when ordering a second item',
    keywordInterestTargeting: 'First-party recent buyer tag + Dynamic catalog tags',
    baseCtr: 0.022,
    baseCpcRatio: 0.65,
    baseCvr: 0.046,
    baseRisk: 25,
    baseConfidence: 0.87,
    budgetShare: 0.04,
    advantages: [
      'Substantially increases Customer Lifetime Value (LTV) at zero cold CAC',
      'Re-engages customers during peak brand goodwill post-unboxing',
      'High gross margin accessories boost blended campaign profitability'
    ],
    disadvantages: [
      'Relies on steady volume of initial footwear transactions',
      'Requires accurate post-purchase customer event segmentation'
    ],
    assumptions: [
      'Complementary SKUs (socks, insoles, cleaner kits) in stock',
      'Post-purchase trigger syncs with customer delivery confirmations'
    ]
  },
  {
    code: 'ARCH-16',
    name: 'YouTube Shorts 15s Action-Oriented Hook',
    funnelStage: 'TOFU',
    platformDefault: 'google',
    adFormat: 'YouTube Shorts Vertical Video Ads with Action Banner',
    creativeAngle: 'Dramatic Visual Demonstration & Durability Stress Test',
    messagingAngle: "We tested these shoes across 500 miles of city streets. Here's what happened.",
    targetingMethod: 'Custom Intent Audiences (Searched related footwear in last 7 days)',
    audienceSegment: 'Active YouTube video consumers searching fitness and sneaker reviews',
    biddingStrategy: 'Maximize Conversions with Video Action Campaign (VAC)',
    retargetingType: 'Intent-Led Video Prospecting',
    demographicTargeting: 'Ages 18-40, Mobile YouTube app users',
    timingStrategy: 'Leisure viewing hours: Late afternoons and weekend mornings',
    offerStrategy: 'Exclusive YouTube Viewer Link with Instant $15 Off Promo',
    keywordInterestTargeting: 'Shoe review queries, fitness YouTube channels, running advice',
    baseCtr: 0.015,
    baseCpcRatio: 0.6,
    baseCvr: 0.018,
    baseRisk: 48,
    baseConfidence: 0.74,
    budgetShare: 0.05,
    advantages: [
      'Captures user attention in engaging full-screen immersive video format',
      'Pairs YouTube video storytelling with Google search intent signals',
      'Strong assisted-conversion lift across search and direct traffic'
    ],
    disadvantages: [
      'Shorts format has higher accidental swipe-away rate',
      'Direct click-through conversion rate lower than Google Search text ads'
    ],
    assumptions: [
      'Hook captures user attention within first 3 seconds',
      'Clear permanent on-screen call-to-action button displayed'
    ]
  },
  {
    code: 'ARCH-17',
    name: 'Amazon Brand Defense & Buy Box Shielding',
    funnelStage: 'BOFU',
    platformDefault: 'amazon',
    adFormat: 'Sponsored Products & Sponsored Brands Header Tile',
    creativeAngle: 'Official Brand Store Authenticity & Full Size Availability',
    messagingAngle: 'Shop Direct from Brand • 100% Genuine Guaranteed with Full Warranty',
    targetingMethod: 'Exact Match Brand Terms & Model Names (Own Brand Keywords)',
    audienceSegment: 'Shoppers explicitly searching for your brand name on Amazon',
    biddingStrategy: 'Top of Search Aggressive Bid Placement (+40% Multiplier)',
    retargetingType: 'Brand Protection',
    demographicTargeting: 'All Amazon searchers querying the exact brand or product name',
    timingStrategy: '24/7 Uncapped Budget to Prevent Competitor Hijack During Off-Hours',
    offerStrategy: 'Official Brand Flagship Guarantee & Bundle Deals',
    keywordInterestTargeting: 'Exact brand name, specific product line names, official store terms',
    baseCtr: 0.062,
    baseCpcRatio: 0.75,
    baseCvr: 0.095,
    baseRisk: 18,
    baseConfidence: 0.94,
    budgetShare: 0.07,
    advantages: [
      'Prevents rival brands from poaching customers searching for you',
      'Extremely high ROAS and conversion rate due to existing intent',
      'Reinforces official brand presence and customer trust'
    ],
    disadvantages: [
      'Can cannibalize organic brand clicks if not monitored carefully',
      'Adds minor cost to demand that already had high organic intent'
    ],
    assumptions: [
      'Brand has existing organic search equity on Amazon',
      'Competitors are bidding on or attempting to conquer brand keywords'
    ]
  },
  {
    code: 'ARCH-18',
    name: 'Weekend Surge Flash Promotion Acceleration',
    funnelStage: 'BOFU',
    platformDefault: 'meta',
    adFormat: 'Instagram Carousel & Instant Experience Canvas',
    creativeAngle: 'Weekend Activity Readiness & Monday Morning Motivation',
    messagingAngle: 'Get Weekend Ready • Upgrade Your Saturday Run Gear Now',
    targetingMethod: 'Warm Site Visitors + Lookalike Active Runners',
    audienceSegment: 'Active urban consumers shopping during weekend downtime',
    biddingStrategy: 'Target CPA with Weekend Budget Escalation (+50% Fri-Sun)',
    retargetingType: 'Temporal Weekend Acquisition',
    demographicTargeting: 'Ages 22-45, Active urban professionals',
    timingStrategy: 'Concentrated Friday 3 PM through Sunday 11 PM window',
    offerStrategy: 'Weekend Special: Free Expedited Shipping for Orders Before Sunday Midnight',
    keywordInterestTargeting: 'Weekend sports, 5k run, fitness shopping, lifestyle',
    baseCtr: 0.025,
    baseCpcRatio: 0.85,
    baseCvr: 0.038,
    baseRisk: 29,
    baseConfidence: 0.85,
    budgetShare: 0.06,
    advantages: [
      'Capitalizes on e-commerce browsing behavior during weekend leisure hours',
      'Clear weekend shipping deadline creates natural urgency',
      'Higher mobile engagement time allows deeper product discovery'
    ],
    disadvantages: [
      'Weekend CPMs can be higher due to increased competition in retail categories',
      'Requires automated budget scheduling to avoid Monday overspend'
    ],
    assumptions: [
      'Weekend mobile landing page speed is under 2.0 seconds',
      'Order processing team ready to handle Monday fulfillment surge'
    ]
  },
  {
    code: 'ARCH-19',
    name: 'Educational Foot Health & Ergonomics Lead',
    funnelStage: 'TOFU',
    platformDefault: 'google',
    adFormat: 'Responsive Display & Native Content Discovery Ads',
    creativeAngle: 'Plantar Fasciitis Relief & Orthopedic Ergonomics Comparison',
    messagingAngle: 'Why 78% of runners suffer from heel pain (and how dual-density foam fixes it)',
    targetingMethod: 'Health & Wellness Contextual Content Placement',
    audienceSegment: 'Individuals researching foot comfort, standing jobs, injury recovery',
    biddingStrategy: 'Target CPA with Content Landing Page Bridge',
    retargetingType: 'Problem-Aware Educational Acquisition',
    demographicTargeting: 'Ages 30-65+, Workers on their feet (healthcare, hospitality, retail)',
    timingStrategy: 'Even daily pacing across health and lifestyle publications',
    offerStrategy: 'Free 30-Day In-Home Wear Test with Zero-Risk Return Guarantee',
    keywordInterestTargeting: 'Plantar fasciitis, arch support, standing all day shoes, orthopedic runners',
    baseCtr: 0.018,
    baseCpcRatio: 0.7,
    baseCvr: 0.026,
    baseRisk: 33,
    baseConfidence: 0.8,
    budgetShare: 0.05,
    advantages: [
      'Taps into a massive underserved problem-aware demographic with severe pain points',
      '30-day wear test guarantee overcomes initial sizing skepticism',
      'Very low price sensitivity when health and daily comfort are addressed'
    ],
    disadvantages: [
      'Requires educational bridge content before pushing to product checkout',
      'Slightly longer consideration cycle from initial click to purchase'
    ],
    assumptions: [
      'Product design provides verifiable arch support and cushioning benefits',
      'Return logistics can handle trial return requests efficiently'
    ]
  },
  {
    code: 'ARCH-20',
    name: 'Regional Tier-2 & Tier-3 Growth Expansion',
    funnelStage: 'MOFU',
    platformDefault: 'meta',
    adFormat: 'Localized Regional Video Reels with Vernacular Nuances',
    creativeAngle: 'Aspirational Premium Brand Status & Nationwide Free Delivery',
    messagingAngle: 'Genuine Global Quality Delivered Right to Your Doorstep',
    targetingMethod: 'Geographic Exclusion of Top 6 Metros (Targeting Tier-2 & Tier-3 Cities)',
    audienceSegment: 'Emerging aspirational consumers in rapidly growing non-metro hubs',
    biddingStrategy: 'Lowest Cost with Broad Reach Guardrail',
    retargetingType: 'Regional Expansion Acquisition',
    demographicTargeting: 'Tier-2/3 high-growth cities, Ages 18-38',
    timingStrategy: 'Steady continuous pacing throughout the week',
    offerStrategy: 'Cash on Delivery (COD) Option Available + Pre-paid Discount Perk',
    keywordInterestTargeting: 'Online shopping, athletic brands, aspirational sportswear',
    baseCtr: 0.028,
    baseCpcRatio: 0.5,
    baseCvr: 0.025,
    baseRisk: 42,
    baseConfidence: 0.77,
    budgetShare: 0.06,
    advantages: [
      'Substantially lower auction CPM and CPC costs than saturated metros',
      'Massive untapped market with skyrocketing brand appetite',
      'Lower ad fatigue rates and higher initial engagement curiosity'
    ],
    disadvantages: [
      'Higher RTO (Return to Origin) rate if Cash on Delivery is enabled',
      'Longer shipping transit times may affect customer satisfaction'
    ],
    assumptions: [
      'Reliable courier partners with doorstep tracking in non-metro pin codes',
      'COD fraud mitigation or pre-paid incentives active'
    ]
  },
  {
    code: 'ARCH-21',
    name: 'Dynamic Search Ads (DSA) Long-Tail Query Harvester',
    funnelStage: 'BOFU',
    platformDefault: 'google',
    adFormat: 'Dynamic Search Ads (DSA) with Auto-Generated Headlines',
    creativeAngle: 'Landing Page Content Synchronization & Exact Match Headline',
    messagingAngle: 'Find Exactly What You Want • In-Stock Catalog Synced Directly',
    targetingMethod: 'Automated Crawl of Website Product Categories & Breadcrumbs',
    audienceSegment: 'Users searching ultra-specific long-tail footwear queries',
    biddingStrategy: 'Target CPA with Negative Keyword Master List Protection',
    retargetingType: 'Long-Tail Intent Harvester',
    demographicTargeting: 'All commercial search queries matching website catalog index',
    timingStrategy: '24/7 Continuous Automated Capture',
    offerStrategy: 'Direct Deep-Link to Exact Size & Color Filtered Product Page',
    keywordInterestTargeting: 'Automated landing page content targeting',
    baseCtr: 0.032,
    baseCpcRatio: 0.85,
    baseCvr: 0.037,
    baseRisk: 27,
    baseConfidence: 0.87,
    budgetShare: 0.06,
    advantages: [
      'Catches thousands of obscure, high-converting long-tail search queries',
      'Zero keyword research overhead: automatically syncs as new inventory arrives',
      'Identifies winning new search queries to promote to manual exact campaigns'
    ],
    disadvantages: [
      'Risk of wasted spend on irrelevant queries without robust negative keyword list',
      'Less granular control over ad headlines'
    ],
    assumptions: [
      'Website has clean semantic HTML headers and rich product structured data',
      'Negative keywords list updated weekly to filter junk traffic'
    ]
  },
  {
    code: 'ARCH-22',
    name: 'Price-Elasticity Clearance & Last-Pairs Liquidation',
    funnelStage: 'BOFU',
    platformDefault: 'meta',
    adFormat: 'Carousel with Bold Red Discount Ribbons & Slash-Pricing',
    creativeAngle: 'Steal of the Season: Massive Markdown on Discontinued Colorways',
    messagingAngle: 'Final Clearance: Up to 40% Off Remaining Sizes • Never to be restocked',
    targetingMethod: 'Deal-Seeker Interest Clusters + Cart Abandoners (Past 60 Days)',
    audienceSegment: 'Price-sensitive deal hunters, bargain shoppers, bargain forums',
    biddingStrategy: 'Lowest Cost with Accelerated Volume Pacing',
    retargetingType: 'Liquidation Clearance',
    demographicTargeting: 'Ages 18-55, Price sensitive shoppers, Outlet store engagers',
    timingStrategy: 'Intense 5-day cycle or until clearance SKU inventory reaches zero',
    offerStrategy: 'Clearance Slash-Price (30-40% Markdown) + Final Sale Policy',
    keywordInterestTargeting: 'Discount shopping, outlet deals, sneaker clearance, sale alerts',
    baseCtr: 0.036,
    baseCpcRatio: 0.65,
    baseCvr: 0.048,
    baseRisk: 31,
    baseConfidence: 0.88,
    budgetShare: 0.05,
    advantages: [
      'Accelerates capital turnover on dead stock and odd-sized pairs',
      'High impulse-buy conversion rate driven by extreme price elasticity',
      'Frees warehouse shelf space and working capital for hero lines'
    ],
    disadvantages: [
      'Lower gross margin per unit sold',
      'Size break stockouts can lead to bounce rate if common sizes sell out fast'
    ],
    assumptions: [
      'Inventory feed automatically hides sizes that reach 0 units',
      'Clearance banner clearly states Final Sale to prevent returns'
    ]
  },
  {
    code: 'ARCH-23',
    name: 'High-Ticket Footwear & Apparel Bundle AOV Booster',
    funnelStage: 'BOFU',
    platformDefault: 'meta',
    adFormat: "Side-by-Side Multi-Item Collection Ad with 'Shop the Look'",
    creativeAngle: 'Full Kit Cohesion: Matching Shoe, Performance Tee & Shorts Bundle',
    messagingAngle: 'The Complete Runner Kit: Save ₹2,500 When Purchased as a Set',
    targetingMethod: 'High Household Income Zip Codes + Lookalike of High-AOV Buyers',
    audienceSegment: 'Affluent shoppers seeking complete coordinated athletic attire',
    biddingStrategy: 'Target ROAS with High Minimum Order Value Floor',
    retargetingType: 'High-AOV Acquisition',
    demographicTargeting: 'Top 25% Household Income, Ages 25-50',
    timingStrategy: 'Evenly paced with evening shopping spike',
    offerStrategy: 'Pre-packaged Bundle Discount (15% bundle savings) with Free Gift Box',
    keywordInterestTargeting: 'Premium sportswear, marathon kits, luxury athletic gear',
    baseCtr: 0.02,
    baseCpcRatio: 1.1,
    baseCvr: 0.032,
    baseRisk: 32,
    baseConfidence: 0.83,
    budgetShare: 0.08,
    advantages: [
      'Significantly boosts Average Order Value (AOV by 1.8x - 2.4x)',
      'Absorbs higher customer acquisition costs while preserving net contribution profit',
      'Exposes customers to multiple product categories in a single transaction'
    ],
    disadvantages: [
      'Higher checkout price threshold creates hesitation and longer time-to-buy',
      'Complex multi-SKU size selection increases potential for partial returns'
    ],
    assumptions: [
      '1-click bundle selection functionality exists on product page',
      'Coordinated apparel sizes are in stock matching the hero footwear sizes'
    ]
  },
  {
    code: 'ARCH-24',
    name: 'Social Proof 5-Star Reviews & PR Quotes Blitz',
    funnelStage: 'MOFU',
    platformDefault: 'google',
    adFormat: 'Responsive Display & YouTube Mid-Roll Video with Trust Badges',
    creativeAngle: "Editorial Acclaim ('Runner World Shoe of the Year') + Verified Reviews",
    messagingAngle: "'The most comfortable shoe I have ever owned' — 12,000+ 5-Star Reviews",
    targetingMethod: 'In-Market Audience for Running Shoes + Website Engagers (Past 30 Days)',
    audienceSegment: 'Hesitant consideration-stage buyers needing trust reinforcement',
    biddingStrategy: 'Maximize Conversions with Target CPA Guardrail',
    retargetingType: 'Trust & Credibility Reinforcement',
    demographicTargeting: 'Ages 22-55, Active online shoppers with consideration hesitation',
    timingStrategy: 'Continuous daily delivery to nurture middle of funnel',
    offerStrategy: 'Risk-Free Trial: 30 Days to test them on the road or 100% money back',
    keywordInterestTargeting: 'Shoe ratings, best running shoes 2026, trusted sportswear',
    baseCtr: 0.023,
    baseCpcRatio: 0.82,
    baseCvr: 0.035,
    baseRisk: 21,
    baseConfidence: 0.9,
    budgetShare: 0.07,
    advantages: [
      'Directly addresses skeptic buyer hesitation with third-party social proof',
      'Substantially decreases bounce rate on landing page',
      'Builds enduring brand credibility that benefits all marketing touchpoints'
    ],
    disadvantages: [
      'Review quotes must be legally verified and updated to prevent stale copy',
      'Less effective for impulse novelty purchases than urgent scarcity offers'
    ],
    assumptions: [
      'Genuine authentic customer reviews and media accolades exist',
      'Landing page prominently features customer photo reviews and ratings'
    ]
  }
];
