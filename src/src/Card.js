import Sister from 'sister';
import Hammer from 'hammerjs';
import rebound from 'rebound';
import prefix from 'prefix';
import Direction from './Direction';
import {
  elementChildren,
  isTouchDevice
} from './utilities';

// Request Animation Frame
const slowRafIE9 = (callbck) => {
  window.setInterval(callbck, 25);
};

const raf = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  slowRafIE9;

/**
 * @param {number} fromX
 * @param {number} fromY
 * @param {Direction[]} allowedDirections
 * @returns {Direction[]} computed direction
 */
const computeDirection = (fromX, fromY, allowedDirections) => {
  const isHorizontal = Math.abs(fromX) > Math.abs(fromY);
  let direction;

  if (isHorizontal) {
    direction = fromX < 0 ? Direction.LEFT : Direction.RIGHT;
  } else {
    direction = fromY < 0 ? Direction.UP : Direction.DOWN;
  }

  if (!allowedDirections.includes(direction)) {
    return Direction.INVALID;
  }

  return direction;
};

/**
 * @param {Config} config
 * @returns {Hammer.Direction} computed direction
 */
const computeHammerDirections = (config) => {
  if (config.vertical && config.lateral) {
    return Hammer.DIRECTION_ALL;
  }
  if (config.vertical) {
    return Hammer.DIRECTION_VERTICAL;
  }
  if (config.lateral) {
    return Hammer.DIRECTION_HORIZONTAL;
  }

  return Hammer.DIRECTION_NONE;
};

/**
 * @param {Stack} stack
 * @param {HTMLElement} targetElement
 * @param {boolean} prepend
 * @returns {object} An instance of Card.
 */
const Card = (stack, targetElement, prepend) => {
  let card;
  let config;
  let currentX;
  let currentY;
  let doMove;
  let eventEmitter;
  let isDraging;
  let isPanning;
  let lastThrow;
  let lastTranslate;
  let lastX;
  let lastY;
  let mc;
  let onSpringUpdate;
  let springSystem;
  let springThrowIn;
  let springThrowOut;
  let throwDirectionToEventName;
  let throwOutDistance;
  let throwWhere;
  let panmoveEvent;

  const getPanMoveEvent = (currentConfig) => {
    if (currentConfig.lateral && !currentConfig.vertical) {
      return (event) => {
        currentX = event.deltaX;
      };
    }

    if (currentConfig.vertical && !currentConfig.lateral) {
      return (event) => {
        currentX = event.deltaX;
      };
    }

    return (event) => {
      currentX = event.deltaX;
      currentY = event.deltaY;
    };
  };

  const construct = () => {
    card = {};
    config = Card.makeConfig(stack.getConfig());
    eventEmitter = Sister();
    springSystem = stack.getSpringSystem();
    springThrowIn = springSystem.createSpring(250, 10);
    springThrowOut = springSystem.createSpring(500, 20);
    lastThrow = {};
    lastTranslate = {
      coordinateX: 0,
      coordinateY: 0
    };
    lastX = 0;
    lastY = 0;

    /* Mapping directions to event names */
    throwDirectionToEventName = {};
    throwDirectionToEventName[Direction.LEFT] = 'throwoutleft';
    throwDirectionToEventName[Direction.RIGHT] = 'throwoutright';
    throwDirectionToEventName[Direction.UP] = 'throwoutup';
    throwDirectionToEventName[Direction.DOWN] = 'throwoutdown';

    springThrowIn.setRestSpeedThreshold(0.05);
    springThrowIn.setRestDisplacementThreshold(0.05);

    springThrowOut.setRestSpeedThreshold(0.05);
    springThrowOut.setRestDisplacementThreshold(0.05);

    throwOutDistance = config.throwOutDistance(config.minThrowOutDistance, config.maxThrowOutDistance);

    mc = new Hammer.Manager(targetElement, {
      recognizers: [
        [
          Hammer.Pan,
          {
            direction: computeHammerDirections(config),
            threshold: 2
          }
        ]
      ]
    });

    if (prepend) {
      Card.prependToParent(targetElement);
    } else {
      Card.appendToParent(targetElement);
    }

    eventEmitter.on('panstart', () => {
      Card.appendToParent(targetElement);

      eventEmitter.trigger('dragstart', { target: targetElement });

      currentX = 0;
      currentY = 0;

      isDraging = true;

      (function animation () {
        if (isDraging) {
          doMove();

          raf(animation);
        }
      })();
    });

    panmoveEvent = getPanMoveEvent(config);

    eventEmitter.on('panmove', panmoveEvent);

    eventEmitter.on('panend', (event) => {
      isDraging = false;

      const coordinateX = lastTranslate.coordinateX + event.deltaX;
      const coordinateY = lastTranslate.coordinateY + event.deltaY;

      const isThrowOut = config.isThrowOut(
        coordinateX,
        coordinateY,
        targetElement,
        config.throwOutConfidence(coordinateX, coordinateY, targetElement)
      );

      // Not really sure about computing direction here and filtering on directions here.
      // It adds more logic. Any suggestion will be appreciated.
      const direction = computeDirection(coordinateX, coordinateY, config.allowedDirections);

      if (isThrowOut && direction !== Direction.INVALID) {
        card.throwOut(coordinateX, coordinateY, direction);
      } else {
        card.throwIn(coordinateX, coordinateY, direction);
      }

      eventEmitter.trigger('dragend', { target: targetElement });
    });

    // "mousedown" event fires late on touch enabled devices, thus listening
    // to the touchstart event for touch enabled devices and mousedown otherwise.
    if (isTouchDevice()) {
      targetElement.addEventListener('touchstart', (event) => {
        if (config.allowMovement(event, isTouchDevice())) {
          eventEmitter.trigger('panstart');
        }
      });

      targetElement.addEventListener('touchend', () => {
        if (isDraging && !isPanning) {
          eventEmitter.trigger('dragend', { target: targetElement });
        }
      });

      // Disable scrolling while dragging the element on the touch enabled devices.
      // @see http://stackoverflow.com/a/12090055/368691
      (() => {
        let dragging;

        targetElement.addEventListener('touchstart', () => {
          dragging = true;
        });

        targetElement.addEventListener('touchend', () => {
          dragging = false;
        });

        global.addEventListener('touchmove', (event) => {
          if (dragging && config.allowMovement(event, isTouchDevice())) {
            event.preventDefault();
          }
        });
      })();
    } else {
      targetElement.addEventListener('mousedown', () => {
        eventEmitter.trigger('panstart');
      });

      targetElement.addEventListener('mouseup', () => {
        if (isDraging && !isPanning) {
          eventEmitter.trigger('dragend', { target: targetElement });
        }
      });
    }

    mc.on('panstart', (event) => {
      isPanning = true;
      eventEmitter.trigger('panstart', event);
    });

    mc.on('panmove', (event) => {
      if (config.allowMovement(event, isTouchDevice())) {
        eventEmitter.trigger('panmove', event);
      }
    });

    mc.on('panend', (event) => {
      if (config.allowMovement(event, isTouchDevice())) {
        isPanning = false;
        eventEmitter.trigger('panend', event);
      }
    });

    springThrowIn.addListener({
      onSpringAtRest: () => {
        eventEmitter.trigger('throwinend', { target: targetElement });
      },
      onSpringUpdate: (spring) => {
        const value = spring.getCurrentValue();
        const coordianteX = rebound.MathUtil.mapValueInRange(value, 0, 1, lastThrow.fromX, 0);
        const coordianteY = rebound.MathUtil.mapValueInRange(value, 0, 1, lastThrow.fromY, 0);

        onSpringUpdate(coordianteX, coordianteY);
      }
    });

    springThrowOut.addListener({
      onSpringAtRest: () => {
        eventEmitter.trigger('throwoutend', { target: targetElement });
      },
      onSpringUpdate: (spring) => {
        const value = spring.getCurrentValue();

        let coordianteX;
        let coordianteY;
        let directionFactor;

        if (lastThrow.direction === Direction.RIGHT || lastThrow.direction === Direction.LEFT) {
          directionFactor = lastThrow.direction === Direction.RIGHT ? 1 : -1;
          coordianteX = rebound.MathUtil.mapValueInRange(value, 0, 1, lastThrow.fromX, throwOutDistance * directionFactor);
          coordianteY = lastThrow.fromY;
        } else if (lastThrow.direction === Direction.UP || lastThrow.direction === Direction.DOWN) {
          directionFactor = lastThrow.direction === Direction.DOWN ? 1 : -1;
          coordianteX = lastThrow.fromX;
          coordianteY = rebound.MathUtil.mapValueInRange(value, 0, 1, lastThrow.fromY, throwOutDistance * directionFactor);
        }

        onSpringUpdate(coordianteX, coordianteY);
      }
    });

    /**
     * Transforms card position based on the current environment variables.
     *
     * @returns {undefined}
     */
    doMove = () => {
      if (currentX === lastX && currentY === lastY) {
        return;
      }

      lastX = currentX;
      lastY = currentY;

      const coordinateX = lastTranslate.coordinateX + currentX;
      const coordianteY = lastTranslate.coordinateY + currentY;
      const rotation = config.rotation(coordinateX, coordianteY, targetElement, config.maxRotation);

      config.transform(targetElement, coordinateX, coordianteY, rotation);

      eventEmitter.trigger('dragmove', {
        offset: coordinateX,
        target: targetElement,
        throwDirection: computeDirection(coordinateX, coordianteY, config.allowedDirections),
        throwOutConfidence: config.throwOutConfidence(coordinateX, coordianteY, targetElement)
      });
    };

    /**
     * Invoked every time the physics solver updates the Spring's value.
     *
     * @param {number} coordinateX
     * @param {number} coordinateY
     * @returns {undefined}
     */
    onSpringUpdate = (coordinateX, coordinateY) => {
      const rotation = config.rotation(coordinateX, coordinateY, targetElement, config.maxRotation);

      lastTranslate.coordinateX = coordinateX || 0;
      lastTranslate.coordinateY = coordinateY || 0;

      config.transform(targetElement, coordinateX, coordinateY, rotation);
    };

    /**
     * @param {Card.THROW_IN|Card.THROW_OUT} where
     * @param {number} fromX
     * @param {number} fromY
     * @param {Direction} [direction]
     * @returns {undefined}
     */
    throwWhere = (where, fromX, fromY, direction) => {
      lastThrow.fromX = config.lateral ? fromX : 0;
      lastThrow.fromY = config.vertical ? fromY : 0;

      // If direction argument is not set, compute it from coordinates.
      lastThrow.direction = direction || computeDirection(fromX, fromY, config.allowedDirections);

      if (where === Card.THROW_IN) {
        Card.appendToParent(targetElement);
        springThrowIn.setCurrentValue(0).setAtRest().setEndValue(1);

        eventEmitter.trigger('throwin', {
          target: targetElement,
          throwDirection: lastThrow.direction
        });
      } else if (where === Card.THROW_OUT) {
        Card.appendToParent(targetElement);
        springThrowOut.setCurrentValue(0).setAtRest().setVelocity(config.velocity).setEndValue(1);

        eventEmitter.trigger('throwout', {
          target: targetElement,
          throwDirection: lastThrow.direction
        });

        /* Emits more accurate events about specific directions */
        eventEmitter.trigger(throwDirectionToEventName[lastThrow.direction], {
          target: targetElement,
          throwDirection: lastThrow.direction
        });
      } else {
        throw new Error('Invalid throw event.');
      }
    };
  };

  construct();

  /**
   * Alias
   */
  card.on = eventEmitter.on;
  card.off = eventEmitter.off;
  card.trigger = eventEmitter.trigger;

  /**
   * Throws a card into the stack from an arbitrary position.
   *
   * @param {number} coordinateX
   * @param {number} coordinateY
   * @param {Direction} [direction]
   * @returns {undefined}
   */
  card.throwIn = (coordinateX, coordinateY, direction) => {
    throwWhere(Card.THROW_IN, coordinateX, coordinateY, direction);
  };

  /**
   * Throws a card out of the stack in the direction away from the original offset.
   *
   * @param {number} coordinateX
   * @param {number} coordinateY
   * @param {Direction} [direction]
   * @returns {undefined}
   */
  card.throwOut = (coordinateX, coordinateY, direction) => {
    throwWhere(Card.THROW_OUT, coordinateX, coordinateY, direction);
  };

  /**
   * Unbinds all Hammer.Manager events.
   * Removes the listeners from the physics simulation.
   *
   * @returns {undefined}
   */
  card.unbindListeners = () => {
    mc.destroy();
    springThrowIn.destroy();
    springThrowOut.destroy();
  };

  /**
   * Unbinds all Hammer.Manager events.
   * Removes the listeners from the physics simulation.
   * Remove card from stack.
   *
   * @returns {undefined}
   */
  card.destroy = () => {
    card.unbindListeners();

    stack.destroyCard(card);
  };

  return card;
};

/**
 * Creates a configuration object.
 *
 * @param {object} config
 * @returns {object}
 */
Card.makeConfig = (config = {}) => {
  const defaultConfig = {
    allowedDirections: [
      Direction.RIGHT,
      Direction.LEFT,
      Direction.UP
    ],
    allowMovement: () => {
      return true;
    },
    isThrowOut: Card.isThrowOut,
    lateral: true,
    maxRotation: 20,
    maxThrowOutDistance: 500,
    minThrowOutDistance: 400,
    rotation: Card.rotation,
    throwOutConfidence: Card.throwOutConfidence,
    throwOutDistance: Card.throwOutDistance,
    transform: Card.transform,
    velocity: 100,
    vertical: true
  };

  return {
    ...defaultConfig,
    ...config
  };
};

/**
 * Uses CSS transform to translate element position and rotation.
 *
 * Invoked in the event of `dragmove` and every time the physics solver is triggered.
 *
 * @param {HTMLElement} element
 * @param {number} coordinateX Horizontal offset from the startDrag.
 * @param {number} coordinateY Vertical offset from the startDrag.
 * @param {number} rotation
 * @returns {undefined}
 */
Card.transform = (element, coordinateX, coordinateY, rotation) => {
  element.style[prefix('transform')] = 'translate3d(0, 0, 0) translate(' + coordinateX + 'px, ' + coordinateY + 'px) rotate(' + rotation + 'deg)';
};

/**
 * Append element to the parentNode.
 *
 * This makes the element first among the siblings. The reason for using
 * this as opposed to zIndex is to allow CSS selector :nth-child.
 *
 * Invoked in the event of mousedown.
 * Invoked when card is added to the stack.
 *
 * @param {HTMLElement} element The target element.
 * @returns {undefined}
 */
Card.appendToParent = (element) => {
  const parentNode = element.parentNode;
  const siblings = elementChildren(parentNode);
  const targetIndex = siblings.indexOf(element);
  const appended = targetIndex + 1 !== siblings.length;

  if (appended) {
    element.remove();
    parentNode.append(element);
  }

  return appended;
};

/**
 * Prepend element to the parentNode.
 *
 * This makes the element last among the siblings.
 *
 * Invoked when card is added to the stack (when prepend is true).
 *
 * @param {HTMLElement} element The target element.
 * @returns {undefined}
 */
Card.prependToParent = (element) => {
  const parentNode = element.parentNode;

  element.remove();
  parentNode.insertBefore(element, parentNode.firstChild);
};

/**
 * Returns a value between 0 and 1 indicating the completeness of the throw out condition.
 *
 * Ration of the absolute distance from the original card position and element width.
 *
 * @param {number} xOffset Distance from the dragStart.
 * @param {number} yOffset Distance from the dragStart.
 * @param {HTMLElement} element Element.
 * @returns {number}
 */
Card.throwOutConfidence = (xOffset, yOffset, element) => {
  const xConfidence = Math.min(Math.abs(xOffset) / element.offsetWidth, 1);
  const yConfidence = Math.min(Math.abs(yOffset) / element.offsetHeight, 1);

  return Math.max(xConfidence, yConfidence);
};

/*
 *Determines if element is being thrown out of the stack.
 *
 * Element is considered to be thrown out when throwOutConfidence is equal to 1.
 *
 * @param {number} xOffset Distance from the dragStart.
 * @param {number} yOffset Distance from the dragStart.
 * @param {HTMLElement} element Element.
 * @param {number} throwOutConfidence config.throwOutConfidence
 * @returns {boolean}
 */
Card.isThrowOut = (xOffset, yOffset, element, throwOutConfidence) => {
  return throwOutConfidence === 1;
};

/**
 * Calculates a distances at which the card is thrown out of the stack.
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
Card.throwOutDistance = (min, max) => {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
};

/**
 * Calculates rotation based on the element x and y offset, element width and maxRotation variables.
 *
 * @param {number} coordinateX Horizontal offset from the startDrag.
 * @param {number} coordinateY Vertical offset from the startDrag.
 * @param {HTMLElement} element Element.
 * @param {number} maxRotation
 * @returns {number} Rotation angle expressed in degrees.
 */
Card.rotation = (coordinateX, coordinateY, element, maxRotation) => {
  const horizontalOffset = Math.min(Math.max(coordinateX / element.offsetWidth, -1), 1);
  const verticalOffset = (coordinateY > 0 ? 1 : -1) * Math.min(Math.abs(coordinateY) / 100, 1);
  const rotation = horizontalOffset * verticalOffset * maxRotation;

  return rotation;
};

Card.THROW_IN = 'in';
Card.THROW_OUT = 'out';

export default Card;
