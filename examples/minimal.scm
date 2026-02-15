(circuit
  (components
    (comp C1
      (type capacitor)
      (pins
        (1)
        (2)
      )
      (props
        (value 100nF)
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
      (requires
        (component_between_nets capacitor VCC GND decoupling_cap)
        (component_between_nets resistor SCL VCC scl_pullup)
        (component_between_nets resistor SDA VCC sda_pullup)
      )
    )
    (comp U_MCU
      (type pico)
      (pins
        (GND (role gnd) (vmin 0) (vmax 0))
        (I2C_SCL (role io) (vmin 0) (vmax 3.6) (optional true))
        (I2C_SDA (role io) (vmin 0) (vmax 3.6) (optional true))
        (LED_GPIO (role io) (vmin 0) (vmax 3.6) (optional true))
        (RUN (role io) (vmin 0) (vmax 3.6) (optional true))
        (UART_RX (role io) (vmin 0) (vmax 3.6) (optional true))
        (UART_TX (role io) (vmin 0) (vmax 3.6) (optional true))
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
      (voltage 3.3)
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
