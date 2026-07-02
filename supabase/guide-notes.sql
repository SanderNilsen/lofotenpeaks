-- Restores MVP planning notes and safety notes for existing seeded trails.
-- Safe to rerun. It only updates public.trails.guide and public.trails.safety_notes.

update public.trails as t
set
  guide = notes.guide,
  safety_notes = notes.safety_notes
from (
  values
    (
      'reinebringen',
      $guide${
        "parking": "Use signed parking in or near Reine and walk to the trailhead. Do not park along the E10, by tunnel openings, or where you block local traffic.",
        "trailhead": "The route starts from the old road by Ramsviktunnelen and climbs almost immediately on the Sherpa-built stone stairway.",
        "bestSeason": "Usually best from late spring to early autumn when the steps are clear of ice. Avoid the route in winter conditions unless you have winter mountain experience.",
        "suitableFor": "Best for fit hikers who are comfortable with steep stairs, crowds, and exposed viewpoints. It is short, but the descent is still demanding.",
        "gearNotes": "Wear shoes with good grip and bring windproof layers. Trekking poles can help on the descent, but keep hands free near exposed sections.",
        "access": "Reine is reachable by road and regional bus. Parking pressure is high in summer, so arrive early, late, or use public transport when possible.",
        "beforeYouGo": [
          "Check cloud cover; the view can disappear quickly.",
          "Start with enough water because there is no reliable refill on the stairs.",
          "Turn around if the steps are icy or crowded beyond your comfort level.",
          "Keep well back from the ridge edge at the viewpoint."
        ]
      }$guide$::jsonb,
      $safety$[
        "Very steep stair ascent; take your time on descent.",
        "Not recommended in winter or when icy.",
        "Expect crowds and limited parking in peak season.",
        "Stay back from exposed ridge edges."
      ]$safety$::jsonb
    ),
    (
      'ryten-kvalvika',
      $guide${
        "parking": "Use signed parking around Fredvang/Innersand and respect private roads, farm access, and local parking instructions.",
        "trailhead": "Most hikers start from the Fredvang/Innersand side and cross open, wet ground before the trail climbs toward Ryten.",
        "bestSeason": "Best from June to September. Early summer can still have wet ground and lingering snow, while autumn can bring fast weather changes.",
        "suitableFor": "Good for hikers who want a longer half-day route and are comfortable near steep coastal cliffs. The Kvalvika extension makes the day more demanding.",
        "gearNotes": "Waterproof footwear is useful because the approach can be boggy. Bring warm layers even on sunny days because the summit is exposed.",
        "access": "The area is easiest by car from Fredvang. Public transport options are limited, so check schedules carefully if you are not driving.",
        "beforeYouGo": [
          "Decide before starting whether you are doing Ryten only or adding Kvalvika Beach.",
          "Keep dogs leashed around sheep and nesting birds.",
          "Avoid cliff-edge photos at the Ryten viewpoint.",
          "Pack out all trash; Kvalvika receives heavy visitor pressure."
        ]
      }$guide$::jsonb,
      $safety$[
        "Boggy sections and wet boardwalks can be slippery.",
        "Cliffs above Kvalvika are very steep; avoid cliff-edge photos.",
        "Keep dogs leashed and avoid disturbing sheep.",
        "Drone use may be restricted because of Lofotodden National Park."
      ]$safety$::jsonb
    ),
    (
      'festvagtind',
      $guide${
        "parking": "Use signed parking or legal pullouts on the road toward Henningsvær. Do not narrow the road or block emergency access.",
        "trailhead": "The trail starts close to the Henningsvær road and climbs steeply through rough terrain toward Heiavatnet and the summit ridge.",
        "bestSeason": "Best in dry summer and early autumn conditions. Wet rock, mud, or snow can make the short route feel much harder.",
        "suitableFor": "Best for confident hikers who are comfortable with steep, rocky ground and occasional use of hands for balance.",
        "gearNotes": "Use grippy hiking shoes and avoid smooth sneakers. Bring a wind shell because the summit is exposed to weather from the Vestfjord.",
        "access": "The trailhead sits on the road to Henningsvær. If you are using bus or taxi, confirm where you can safely start and finish.",
        "beforeYouGo": [
          "Avoid the hike after heavy rain if you are not comfortable on slippery rock.",
          "Start early or late in peak season to reduce parking pressure.",
          "Stay on the worn route to reduce erosion.",
          "Save energy for the descent; it is steeper than the distance suggests."
        ]
      }$guide$::jsonb,
      $safety$[
        "Steep and rocky terrain despite the short distance.",
        "Avoid in heavy rain; rocks and mud become slippery.",
        "Some sections may require hands for balance.",
        "Popular route with limited parking; start early or late."
      ]$safety$::jsonb
    ),
    (
      'offersoykammen',
      $guide${
        "parking": "Parking and trailhead options vary near Nappstraumen and Offersøy. Use signed public parking and check local signs before setting off.",
        "trailhead": "The route starts near the Nappstraumen/Leknes side and climbs quickly through grass, mud, and rocky sections toward the ridge.",
        "bestSeason": "Best from late spring to autumn. The short distance makes it tempting in poor weather, but wet grass can be very slippery.",
        "suitableFor": "Suitable for hikers who want a compact route with a strong viewpoint payoff, but the sustained climb still requires steady footing.",
        "gearNotes": "Wear shoes that grip wet grass and mud. A windproof layer is useful because the summit is open and exposed.",
        "access": "Offersøykammen is close to Leknes by car. Public transport may get you near the area, but check walking distance to the trailhead.",
        "beforeYouGo": [
          "Verify the current trailhead and parking option locally.",
          "Avoid stepping onto steep grass when it is wet.",
          "Keep distance from summit drops.",
          "Bring a map if visibility is poor; several small paths cross the area."
        ]
      }$guide$::jsonb,
      $safety$[
        "Steep ascent with little warm-up.",
        "Use caution on wet grass and muddy sections.",
        "Summit has steep drops; keep distance from edges.",
        "Parking and trailhead options vary; verify locally before starting."
      ]$safety$::jsonb
    ),
    (
      'tjeldbergtind',
      $guide${
        "parking": "Use signed parking near the chosen Svolvær/Kabelvåg trailhead. Several route variants exist, so parking depends on your start point.",
        "trailhead": "Common routes start between Svolvær and Kabelvåg, then climb through forest and open slopes toward the broad summit area.",
        "bestSeason": "Often usable from spring to autumn, but mud, ice, and snow can change the difficulty quickly outside summer.",
        "suitableFor": "A good first Lofoten summit for hikers with basic fitness, as long as conditions are dry and visibility is reasonable.",
        "gearNotes": "Trail shoes or light hiking boots are enough in dry summer conditions. Bring a shell and extra layer for the open summit.",
        "access": "This is one of the more accessible hikes near Svolvær. It can work without a car if you plan the route and transport in advance.",
        "beforeYouGo": [
          "Choose your route variant before starting.",
          "Expect muddy forest sections after rain.",
          "Use a map if doing a loop rather than an out-and-back.",
          "Turn around if low cloud makes navigation uncertain."
        ]
      }$guide$::jsonb,
      $safety$[
        "Forest and upper slopes can be muddy after rain.",
        "Several route variants exist; use a map/GPX if doing the loop.",
        "Winter conditions can make an otherwise moderate route harder.",
        "Limited parking near some trailheads."
      ]$safety$::jsonb
    ),
    (
      'himmeltindan',
      $guide${
        "parking": "Use signed parking at the Haukland Beach area and follow local parking rules. The area is popular and can fill up in summer.",
        "trailhead": "The common route starts from Haukland Beach and climbs steadily through open terrain toward the upper ridge and viewpoint.",
        "bestSeason": "Best in stable summer weather. Snow, wind, and low cloud can make the upper mountain serious even when the beach feels calm.",
        "suitableFor": "Best for fit hikers who can handle a long, sustained climb and exposed weather near the top.",
        "gearNotes": "Bring proper hiking shoes, warm layers, food, water, and a map/GPX. The upper section can feel cold and exposed.",
        "access": "Haukland is easiest by car from Leknes. Public transport options vary, so check schedules before relying on them.",
        "beforeYouGo": [
          "Respect signs around restricted summit areas.",
          "Check wind and cloud height, not only rain.",
          "Carry enough food and water for a longer mountain day.",
          "Turn around before the ridge if visibility or footing becomes poor."
        ]
      }$guide$::jsonb,
      $safety$[
        "Long sustained climb with exposed weather near the top.",
        "Highest summit area may be restricted; respect signs and closures.",
        "Carry warm layers even in summer.",
        "Loose rock and steep upper terrain require careful footing."
      ]$safety$::jsonb
    ),
    (
      'mannen',
      $guide${
        "parking": "Use signed parking at Haukland Beach and respect local traffic flow. The beach area can be busy on good-weather days.",
        "trailhead": "The route starts from the Haukland area, follows an old road or track at first, then climbs grassy slopes toward the ridge.",
        "bestSeason": "Best from late spring to autumn. Wet grass and mud can make the ridge approach slippery after rain.",
        "suitableFor": "Suitable for many hikers with moderate fitness, but still requires care near exposed ridge sections.",
        "gearNotes": "Wear grippy shoes and bring a wind shell. The route is short enough to underestimate, but weather can still change quickly.",
        "access": "Haukland is easiest by car from Leknes. If using public transport, check the return timing before starting.",
        "beforeYouGo": [
          "Avoid cliff edges and exposed photo spots.",
          "Keep dogs leashed around sheep.",
          "Do not continue onto steeper terrain if the grass is wet.",
          "Leave enough time to enjoy Haukland or Uttakleiv after the hike."
        ]
      }$guide$::jsonb,
      $safety$[
        "Some exposed parts near the ridge and summit.",
        "Grass and mud can be slippery after rain.",
        "Use care around sheep and keep dogs leashed.",
        "Parking at Haukland can be busy in summer."
      ]$safety$::jsonb
    ),
    (
      'munken',
      $guide${
        "parking": "Use signed parking near Sørvågen/Sørvågvatnet and avoid blocking local roads or cabin access.",
        "trailhead": "The route starts near Sørvågvatnet and follows the Munkebu direction through lakes, rock slabs, boggy ground, and steeper sections.",
        "bestSeason": "Best in settled summer weather. This is a longer route, so avoid low cloud, heavy rain, and strong wind.",
        "suitableFor": "Best for experienced hikers with good fitness who are comfortable on rock slabs and longer days away from the road.",
        "gearNotes": "Bring full mountain layers, food, water, a map/GPX, and shoes that grip wet rock. Poles can help on long descents.",
        "access": "Sørvågen is reachable by road and regional bus, but the route itself is committing. Plan transport so you are not rushing the descent.",
        "beforeYouGo": [
          "Start early enough for a 5-7 hour mountain day.",
          "Check that chains, slabs, and wet sections are within your comfort level.",
          "Do not continue into scrambling terrain unless you have the experience for it.",
          "Turn around if cloud drops onto the route or the rock becomes too wet."
        ]
      }$guide$::jsonb,
      $safety$[
        "Longer route requiring good fitness and enough food/water.",
        "Rock slabs, chains and wet sections can be slippery.",
        "Weather changes quickly; carry windproof and waterproof layers.",
        "Do not continue to exposed rock teeth/scrambling terrain unless experienced."
      ]$safety$::jsonb
    )
) as notes(trail_id, guide, safety_notes)
where t.id = notes.trail_id;
