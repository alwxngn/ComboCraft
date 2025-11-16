from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import time

app = Flask(__name__)
CORS(app)

last_gesture = "NONE"
last_gesture_time = 0
combo_counter = 0
browser_gesture = "NONE"

spell_usage = {
    "FIREBALL": 0,
    "ICE_SHARD": 0,
    "LIGHTNING": 0,
    "EXPLOSION_COMBO": 0,
    "HEALING_LIGHT_COMBO": 0,
    "LIGHTNING_STRIKE_COMBO": 0,
    "PUNCH_COMBO": 0
}

ATTACK_COOLDOWN = 0
last_attack_time = 0

MAX_MANA = 100
current_mana = 100
last_mana_regen_time = time.time()
MANA_REGEN_RATE = 12
MANA_COSTS = {
    "FIREBALL": 20,
    "ICE_SHARD": 15,
    "LIGHTNING": 25,
    "EXPLOSION_COMBO": 35,
    "HEALING_LIGHT_COMBO": 30,
    "LIGHTNING_STRIKE_COMBO": 40,
    "PUNCH_COMBO": 10
}

current_event = "NONE"
event_start_time = 0
EVENT_DURATION = 7
EVENT_COOLDOWN = 10
last_event_end_time = 0

POSSIBLE_EVENTS = ["WEAKFIRE", "WEAKICE"]

challenge_progress = 0
challenge_target = 0
challenge_gesture = "NONE"

@app.route('/set_gesture', methods=['POST'])
def set_gesture():
    global browser_gesture
    data = request.json
    browser_gesture = data.get('gesture', 'NONE')
    return jsonify({'status': 'ok'})

@app.route('/add_mana', methods=['POST'])
def add_mana():
    global current_mana
    data = request.json
    mana_amount = data.get('amount', 30)
    if mana_amount < 0 and current_mana >= 999:
        current_mana = MAX_MANA
    else:
        current_mana = min(MAX_MANA, max(0, current_mana + mana_amount))
    return jsonify({'status': 'ok', 'mana': current_mana})

@app.route('/set_tutorial_mode', methods=['POST'])
def set_tutorial_mode():
    global current_mana
    current_mana = 999
    return jsonify({'status': 'ok', 'mana': current_mana})

@app.route('/reset_combo', methods=['POST'])
def reset_combo():
    global combo_counter
    combo_counter = 0
    return jsonify({'status': 'ok', 'combo': combo_counter})

@app.route('/get_spell_stats', methods=['GET'])
def get_spell_stats():
    global spell_usage
    
    favorite_spell = None
    max_usage = 0
    for spell, count in spell_usage.items():
        if count > max_usage:
            max_usage = count
            favorite_spell = spell
    
    spell_display_names = {
        "FIREBALL": "Fireball",
        "ICE_SHARD": "Ice Shard",
        "LIGHTNING": "Lightning",
        "EXPLOSION_COMBO": "Explosion Combo",
        "HEALING_LIGHT_COMBO": "Healing Light Combo",
        "LIGHTNING_STRIKE_COMBO": "Lightning Strike Combo",
        "PUNCH_COMBO": "Punch Combo"
    }
    
    favorite_display = spell_display_names.get(favorite_spell, "None") if favorite_spell else "None"
    
    return jsonify({
        'spell_usage': spell_usage,
        'favorite_spell': favorite_spell,
        'favorite_spell_display': favorite_display,
        'favorite_spell_count': max_usage
    })

@app.route('/reset_spell_stats', methods=['POST'])
def reset_spell_stats():
    global spell_usage
    spell_usage = {
        "FIREBALL": 0,
        "ICE_SHARD": 0,
        "LIGHTNING": 0,
        "EXPLOSION_COMBO": 0,
        "HEALING_LIGHT_COMBO": 0,
        "LIGHTNING_STRIKE_COMBO": 0,
        "PUNCH_COMBO": 0
    }
    return jsonify({'status': 'ok', 'spell_usage': spell_usage})

@app.route('/get_command')
def get_command():
    global browser_gesture, current_mana, last_mana_regen_time
    global last_gesture, combo_counter, last_attack_time
    global current_event, event_start_time, last_event_end_time
    global challenge_progress, challenge_target, challenge_gesture
    
    is_tutorial = current_mana >= 999
    
    if not is_tutorial:
        current_time = time.time()
        time_since_regen = current_time - last_mana_regen_time
        if time_since_regen >= 0.1:
            mana_regen = MANA_REGEN_RATE * time_since_regen
            current_mana = min(MAX_MANA, current_mana + mana_regen)
            last_mana_regen_time = current_time
    
    current_gesture = browser_gesture
    
    if current_gesture == "THUMBS_UP":
        command = "THUMBS_UP"
        last_gesture = current_gesture
        return jsonify({
            "command": command,
            "event": "NONE",
            "combo": combo_counter,
            "gesture": current_gesture,
            "cooldown": 0,
            "mana": current_mana,
            "max_mana": MAX_MANA,
            "challenge_progress": 0,
            "challenge_target": 0
        })
    
    if current_gesture != "NONE":
        print(f"🖐️  DETECTED: {current_gesture}")
    
    command = "NONE"
    
    if current_gesture != "NONE" and current_gesture != last_gesture:
        current_time = time.time()
        if (current_time - last_attack_time) > ATTACK_COOLDOWN:
            if current_gesture == "FIST" and last_gesture == "OPEN_PALM":
                command = "EXPLOSION_COMBO"
                combo_counter += 2
            elif current_gesture == "POINT" and last_gesture == "OPEN_PALM":
                command = "HEALING_LIGHT_COMBO"
                combo_counter += 2
            elif current_gesture == "FIST" and last_gesture == "POINT":
                command = "LIGHTNING_STRIKE_COMBO"
                combo_counter += 2
            elif current_gesture == "FIST":
                command = "FIREBALL"
                combo_counter += 1
            elif current_gesture == "OPEN_PALM": 
                command = "ICE_SHARD"
                combo_counter += 1
            elif current_gesture == "POINT": 
                command = "LIGHTNING"
                combo_counter += 1

            if command != "NONE":
                mana_cost = MANA_COSTS.get(command, 0)
                is_tutorial_mode = current_mana >= 999
                if is_tutorial_mode or current_mana >= mana_cost:
                    if not is_tutorial_mode:
                        current_mana -= mana_cost
                    if command in spell_usage:
                        spell_usage[command] += 1
                    last_attack_time = current_time
                    print(f"⚡ COMMAND SENT: {command} (Mana: {current_mana}/{MAX_MANA})")
                else:
                    command = "INSUFFICIENT_MANA"
                    print(f"❌ Not enough mana for {command}! Need {mana_cost}, have {current_mana}")
        else:
            print("Spell on cooldown...")
            command = "COOLDOWN"

    current_time = time.time()

    if current_event != "NONE":
        if (current_time - event_start_time) > EVENT_DURATION:
            print(f"Event {current_event} has EXPIRED.")
            current_event = "NONE"
            last_event_end_time = current_time
            challenge_progress = 0
            challenge_target = 0
            challenge_gesture = "NONE"
    elif (current_time - last_event_end_time) > EVENT_COOLDOWN:
        current_event = random.choice(POSSIBLE_EVENTS)
        event_start_time = current_time
        print(f"Event {current_event} has STARTED!")
        challenge_progress = 0
        challenge_target = 0
        challenge_gesture = "NONE"

    last_gesture = current_gesture
    
    current_time = time.time()
    cooldown_time = max(0, ATTACK_COOLDOWN - (current_time - last_attack_time))
    
    return jsonify({
        "command": command, 
        "event": current_event, 
        "combo": combo_counter, 
        "gesture": current_gesture,
        "cooldown": cooldown_time,
        "mana": current_mana,
        "max_mana": MAX_MANA,
        "challenge_progress": challenge_progress,
        "challenge_target": challenge_target
    })

if __name__ == '__main__':
    print("--- CV Boss Battle Backend Server ---")
    print("Running on http://localhost:5001")
    print("Serving gesture commands at /get_command")
    print("Press CTRL+C to stop.")
    app.run(debug=True, port=5001)