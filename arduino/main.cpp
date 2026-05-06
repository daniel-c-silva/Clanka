#include "Arduino.h"

// ! defining pins

const int buttonPin = 2;

// * left driver pins.
const int leftDirPin = 8;
const int leftStepPin = 9;
const int leftEnablePin = 10;

// * right driver pins.
const int rightDirPin = 5;
const int rightStepPin = 6;
const int rightEnablePin = 7;

void setup() {
  // * serial begin at 9600 baud rate for debugging purposes
  Serial.begin(9600);
  
  // * driver pins
  pinMode(leftDirPin, OUTPUT);
  pinMode(leftStepPin, OUTPUT);
  pinMode(leftEnablePin, OUTPUT);

  pinMode(rightDirPin, OUTPUT);
  pinMode(rightStepPin, OUTPUT);
  pinMode(rightEnablePin, OUTPUT);


  // ! actual setup:
  // * Set the "enable" pin to LOW to turn the driver ON
  digitalWrite(leftEnablePin, LOW); 
  digitalWrite(rightEnablePin, LOW);
  
  // * Set the direction (HIGH = Clockwise, LOW = other way)
  digitalWrite(leftDirPin, HIGH);
  digitalWrite(rightDirPin, HIGH);
}

void loop() {
  if (Serial.available() > 0) {
    
    // * read the incoming byte (command):
    char incomingCMD = Serial.read();



    // ! if the command is "F" , move both(forward)
    if (incomingCMD == 'F'){
        for (int i = 0; i < 200; i++){ // * starting the loop at 0, until it loops 200 times(full rotation 1.8 * 360)
            digitalWrite(leftStepPin, HIGH); 
            digitalWrite(rightStepPin, HIGH);

            delayMicroseconds(2000); // * Delay for 2000 microseconds building enough torque for the weight necessary

            digitalWrite(leftStepPin, LOW); 
            digitalWrite(rightStepPin, LOW);

            delayMicroseconds(2000); // * Delay for 2000 microseconds building enough torque for the weight necessary
            }}

      // ! if the command is "L" , move left
    if (incomingCMD == 'L'){ // * moving only the right motor to move left
      for(int i = 0; i < 200; i++){
          digitalWrite(rightStepPin, HIGH); 

          delayMicroseconds(2000); 

          digitalWrite(rightStepPin, LOW);

          delayMicroseconds(2000);  
        }}

      // ! if the command is "R" , move right
    if (incomingCMD == 'R'){ // * moving only the left motor to move right
      for(int i = 0; i < 200; i++){
          digitalWrite(leftStepPin, HIGH);

          delayMicroseconds(2000);  

          digitalWrite(leftStepPin, LOW);

          delayMicroseconds(2000);   
        }}


        // ! if the command is "B" , move backward

        if (incomingCMD == 'B'){
         

            digitalWrite(leftDirPin , LOW);
            digitalWrite(rightDirPin, LOW);

            delayMicroseconds(2000); // Delay for(2000) microseconds(2000); // Delay for 2000 milliseconds

            for (int i = 0; i < 200; i++){

            digitalWrite(leftStepPin, HIGH);
            digitalWrite(rightStepPin, HIGH);

            delayMicroseconds(2000); // * Delay for 2000 microseconds building enough torque for the weight necessary

            digitalWrite(leftStepPin, LOW);
            digitalWrite(rightStepPin, LOW);

            delayMicroseconds(2000);
          }

            digitalWrite(leftDirPin, HIGH); // ! reset direction back to forward after moving
            digitalWrite(rightDirPin, HIGH);
        }

        


        }

      }
      


      


