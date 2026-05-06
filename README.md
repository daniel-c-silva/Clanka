# Clanka

![Motors Simulation](assets/motors-simulation.gif)

## robot friend, still in the begining of the begginings but Clanka is supposed to be an ai friend powered by Mistral AI that portrais emotions, that you can control remotely and eventually be automatic.


## Hardware & Engineering
Clanka is built on a custom-designed chassis with mechanical tolerances.

### Mechanical Design
Detailed technical drawings for the chassis:
- **Sprocket Design:** $R=40\text{mm}$ ([View PDF](assets/D_Sprocket.pdf))
- **Base Plate:** $450\text{mm} \times 370\text{mm}$ ([View PDF](assets/D_Base.pdf))
- **Enclosure:** Custom Box Design ([View PDF](assets/D_Box.pdf))
- **Motor Specs:** DC/Stepper mounting specs ([View PDF](assets/D_DC-motor.pdf))
  

### Wiring Diagram
Refer to the blueprint below for pin mapping between the Raspberry Pi, Arduino Uno, and A4988 drivers.
([View PDF](assets/main-components-diagram.pdf))

![Wiring Blueprint](assets/main-components-diagram.jpg)

### Core Idea Sketch + Values
![Torque Calculations](assets/calcs/BaseValues.png)

### Torque Analysis
Calculations were performed to ensure motors could withstand the load.
![Torque Calculations](assets/calcs/TorqueCalcs.JPG)

## Tech Stack

```
* **Microcontroller:** Arduino Uno (C++)
* **SBC:** Raspberry Pi 4/5 (Python Backend)
* **Motor Control:** 2x NEMA 17 Stepper Motors + A4988 Drivers
* **Communication:** Serial/USB Bridge
```


# Run

## Navigate to the backend directory
```
cd backend
```

# Install dependencies (pyserial, flask, etc.)
```
pip install -r requirements.txt
```

# Start the Clanka Brain
```
python3 main.py (still pending the brain lol)
```


