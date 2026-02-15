(circuit
  (components
    (comp C_BME
      (type capacitor)
      (pins
        (1)
        (2)
      )
      (props
        (value 100nF)
      )
    )
    (comp D1
      (type led)
      (pins
        (A)
        (K)
      )
      (props
      )
    )
    (comp R_LED
      (type resistor)
      (pins
        (1)
        (2)
      )
      (props
        (value 330Ω)
      )
    )
    (comp R_RUN
      (type resistor)
      (pins
        (1)
        (2)
      )
      (props
        (value 10kΩ)
      )
    )
    (comp R_SCL
      (type resistor)
      (pins
        (1)
        (2)
      )
      (props
        (value 4.7kΩ)
      )
    )
    (comp R_SDA
      (type resistor)
      (pins
        (1)
        (2)
      )
      (props
        (value 4.7kΩ)
      )
    )
    (comp SW_RESET
      (type switch)
      (pins
        (1)
        (2)
      )
      (props
      )
    )
    (comp U_BME280
      (type bme280)
      (pins
        (GND (role gnd) (vmin 0) (vmax 0))
        (SCL (role io) (vmin 0) (vmax 3.6))
        (SDA (role io) (vmin 0) (vmax 3.6))
        (VCC (role power_in) (vmin 1.71) (vmax 3.6))
      )
      (props
      )
    )
    (comp U_PICO
      (type pico)
      (pins
        (GND (role gnd) (vmin 0) (vmax 0))
        (I2C_SCL (role io) (vmin 0) (vmax 3.6))
        (I2C_SDA (role io) (vmin 0) (vmax 3.6))
        (LED_GPIO (role io) (vmin 0) (vmax 3.6))
        (RUN (role io) (vmin 0) (vmax 3.6))
        (VCC (role power_in) (vmin 1.8) (vmax 3.6))
      )
      (props
      )
    )
  )
  (nets
    (net GND
      (voltage 0)
      (connect
        (C_BME 2)
        (D1 K)
        (SW_RESET 2)
        (U_BME280 GND)
        (U_PICO GND)
      )
    )
    (net I2C_SCL
      (connect
        (R_SCL 1)
        (U_BME280 SCL)
        (U_PICO I2C_SCL)
      )
    )
    (net I2C_SDA
      (connect
        (R_SDA 1)
        (U_BME280 SDA)
        (U_PICO I2C_SDA)
      )
    )
    (net LED_ANODE
      (voltage 3.3)
      (connect
        (D1 A)
        (R_LED 2)
      )
    )
    (net LED_SIG
      (voltage 3.3)
      (connect
        (R_LED 1)
        (U_PICO LED_GPIO)
      )
    )
    (net RUN
      (voltage 3.3)
      (connect
        (R_RUN 1)
        (SW_RESET 1)
        (U_PICO RUN)
      )
    )
    (net VCC_3V3
      (voltage 3.3)
      (connect
        (C_BME 1)
        (R_RUN 2)
        (R_SCL 2)
        (R_SDA 2)
        (U_BME280 VCC)
        (U_PICO VCC)
      )
    )
  )
  (constraints
    (i2c
      (scl I2C_SCL)
      (sda I2C_SDA)
      (vcc VCC_3V3)
    )
  )
)
