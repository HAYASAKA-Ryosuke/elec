(circuit
  (components
    (comp U_BOOST
      (type boost_5v)
      (pins
        (GND (role gnd) (vmin 0) (vmax 0))
        (VIN (role power_in) (vmin 2.5) (vmax 4.2))
        (VOUT (role power_out) (vmin 4.8) (vmax 5.2))
      )
      (props
      )
    )
    (comp U_DEV5
      (type uart_5v_device)
      (pins
        (GND (role gnd) (vmin 0) (vmax 0))
        (RX (role io) (vmin 0) (vmax 5.5))
        (TX (role io) (vmin 0) (vmax 5.5))
        (VCC (role power_in) (vmin 4.5) (vmax 5.5))
      )
      (props
      )
    )
    (comp U_LDO
      (type ldo_3v3)
      (pins
        (GND (role gnd) (vmin 0) (vmax 0))
        (VIN (role power_in) (vmin 4.5) (vmax 16))
        (VOUT (role power_out) (vmin 3.2) (vmax 3.4))
      )
      (props
      )
    )
    (comp U_LSH
      (type level_shifter)
      (pins
        (A1 (role io) (vmin 0) (vmax 3.6))
        (A2 (role io) (vmin 0) (vmax 3.6))
        (B1 (role io) (vmin 0) (vmax 5.5))
        (B2 (role io) (vmin 0) (vmax 5.5))
        (GND (role gnd) (vmin 0) (vmax 0))
        (HV (role power_in) (vmin 4.5) (vmax 5.5))
        (LV (role power_in) (vmin 1.65) (vmax 3.6))
      )
      (props
      )
    )
    (comp U_PICO
      (type pico)
      (pins
        (GND (role gnd) (vmin 0) (vmax 0))
        (UART_RX (role io) (vmin 0) (vmax 3.6))
        (UART_TX (role io) (vmin 0) (vmax 3.6))
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
        (U_BOOST GND)
        (U_DEV5 GND)
        (U_LDO GND)
        (U_LSH GND)
        (U_PICO GND)
      )
    )
    (net UART_RX_3V3
      (voltage 3.3)
      (connect
        (U_LSH A2)
        (U_PICO UART_RX)
      )
    )
    (net UART_RX_5V
      (voltage 5)
      (connect
        (U_DEV5 TX)
        (U_LSH B2)
      )
    )
    (net UART_TX_3V3
      (voltage 3.3)
      (connect
        (U_LSH A1)
        (U_PICO UART_TX)
      )
    )
    (net UART_TX_5V
      (voltage 5)
      (connect
        (U_DEV5 RX)
        (U_LSH B1)
      )
    )
    (net VBAT
      (voltage 3.7)
      (connect
        (U_BOOST VIN)
        (U_LDO VIN)
      )
    )
    (net VCC_3V3
      (voltage 3.3)
      (connect
        (U_LDO VOUT)
        (U_LSH LV)
        (U_PICO VCC)
      )
    )
    (net VCC_5V
      (voltage 5)
      (connect
        (U_BOOST VOUT)
        (U_DEV5 VCC)
        (U_LSH HV)
      )
    )
  )
  (constraints
  )
)
