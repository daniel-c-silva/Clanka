import serial # * serial communication libraty
import time # * for sleeping 



arduino = serial.Serial('/dev/ttyACM0', 9600) # * 9600 is the speed of the connection. dev/ttyamc0 is the standard usb port for arduino on a raspberry pi 
time.sleep(2) # * Arduino needs a moment to wake up after connecting so we wait two seconds



# ! function to move left.
def move_left():
    arduino.write(b'L') # 'b' tells Python to send the raw byte for the letter L

# ! function to move right.
def move_right():
    arduino.write(b'R') # Sends the letter R

# ! function to move both motors.
def move_both():
    arduino.write(b'F') # Sends the letter F

def move_back():
    arduino.write(b'B') # Sends the letter B to move back
