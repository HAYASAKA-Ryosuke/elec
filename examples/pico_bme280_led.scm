(circuit
  (components
    (comp C_BME
      (type capacitor)
      (pins (1 2))
      (props
        (value 100nF)
      )
    )
    (comp D1
      (type led)
      (pins (A K))
      (props
      )
    )
    (comp R_LED
      (type resistor)
      (pins (1 2))
      (props
        (value 330Ω)
      )
    )
    (comp R_RUN
      (type resistor)
      (pins (1 2))
      (props
        (value 10kΩ)
      )
    )
    (comp R_SCL
      (type resistor)
      (pins (1 2))
      (props
        (value 4.7kΩ)
      )
    )
    (comp R_SDA
      (type resistor)
      (pins (1 2))
      (props
        (value 4.7kΩ)
      )
    )
    (comp SW_RESET
      (type switch)
      (pins (1 2))
      (props
      )
    )
    (comp U_BME280
      (type bme280)
      (pins (GND SCL SDA VCC))
      (props
      )
    )
    (comp U_PICO
      (type pico)
      (pins (GND I2C_SCL I2C_SDA LED_GPIO RUN VCC))
      (props
      )
    )
  )
  (nets
    (net GND
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
      (connect
        (D1 A)
        (R_LED 2)
      )
    )
    (net LED_SIG
      (connect
        (R_LED 1)
        (U_PICO LED_GPIO)
      )
    )
    (net RUN
      (connect
        (R_RUN 1)
        (SW_RESET 1)
        (U_PICO RUN)
      )
    )
    (net VCC_3V3
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
