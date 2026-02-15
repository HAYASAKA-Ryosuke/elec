(circuit
  (components
    (comp U_MCU
      (type pico)
      (pins
        (VCC (role power_in) (vmin 1.8) (vmax 3.6))
        (GND (role gnd) (vmin 0) (vmax 0))
        (GPIO (role io) (vmin 0) (vmax 3.6))
      )
      (props)
    )
    (comp R_B
      (type resistor)
      (pins (1) (2))
      (props
        (value 1kohm)
      )
    )
    (comp Q1
      (type bjt_npn)
      (pins
        (B (role io) (net_role signal))
        (C (role io) (gt E) (neq E))
        (E (role io) (net_role gnd) (lt C) (neq C))
      )
      (props)
    )
    (comp RL1
      (type relay)
      (pins (1) (2))
      (requires
        (component_between_nets diode 1 2 flyback_diode)
      )
      (props)
    )
  )
  (nets
    (net VCC_3V3
      (voltage 3.3)
      (connect
        (U_MCU VCC)
      )
    )
    (net GND
      (voltage 0)
      (connect
        (U_MCU GND)
        (Q1 E)
      )
    )
    (net GPIO_DRIVE
      (voltage 3.3)
      (connect
        (U_MCU GPIO)
        (R_B 1)
      )
    )
    (net BASE
      (voltage 0.7)
      (connect
        (R_B 2)
        (Q1 B)
      )
    )
    (net VCC_12V
      (voltage 12)
      (connect
        (RL1 1)
      )
    )
    (net RELAY_LOW
      (voltage 12)
      (connect
        (RL1 2)
        (Q1 C)
      )
    )
  )
  (constraints)
)
