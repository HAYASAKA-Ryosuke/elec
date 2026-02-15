(circuit
  (components
    (comp C1
      (type capacitor)
      (pins (1 2))
      (props
        (value 100nF)
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
    (comp U_BME280
      (type bme280)
      (pins (GND SCL SDA VCC))
      (props
      )
    )
    (comp U_MCU
      (type pico)
      (pins (GND I2C_SCL I2C_SDA VCC))
      (props
      )
    )
  )
  (nets
    (net GND
      (connect
        (C1 2)
        (U_BME280 GND)
        (U_MCU GND)
      )
    )
    (net I2C_SCL
      (connect
        (R_SCL 1)
        (U_BME280 SCL)
        (U_MCU I2C_SCL)
      )
    )
    (net I2C_SDA
      (connect
        (R_SDA 1)
        (U_BME280 SDA)
        (U_MCU I2C_SDA)
      )
    )
    (net VCC_3V3
      (connect
        (C1 1)
        (R_SCL 2)
        (R_SDA 2)
        (U_BME280 VCC)
        (U_MCU VCC)
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
