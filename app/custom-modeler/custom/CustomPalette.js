import { indexOf } from 'diagram-js/lib/util/Collections';
import {
  assign
} from 'min-dash';


/**
 * A palette that allows you to create BPMN _and_ custom elements.
 */
export default function PaletteProvider(palette, create, elementFactory, spaceTool, lassoTool) {

  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;

  palette.registerProvider(this);
}

PaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool'
];


PaletteProvider.prototype.getPaletteEntries = function (element) {

  var actions = {},
    create = this._create,
    elementFactory = this._elementFactory,
    spaceTool = this._spaceTool,
    lassoTool = this._lassoTool;


  function createAction(type, group, className, title, options) {

    function createListener(event) {
      console.log("event", event)
      var shape = elementFactory.createShape(assign({ type: type }, options));

      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }

      if ((String)(event.srcElement.className).includes("-risk")) {
        console.log("RISK SELECTED", shape.businessObject)



        if (confirm('Do you want to create a new risk?')) {
          // Save it!
          console.log('New Risk Form Here');
          let a = prompt("display NEW form here", "risk name");
          shape.businessObject.set("riskId", a)
          create.start(event, shape);
        } else {
          console.log('Edit Risk Form Here');
          shape.businessObject.set("riskId", "Some Edited Risk")
          create.start(event, shape);
        }

      } else {
        create.start(event, shape);
      }


    }

    var shortType = type.replace(/^bpmn:/, '');

    return {
      group: group,
      className: className,
      title: title || 'Create ' + shortType,
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  function createParticipant(event, collapsed) {
    create.start(event, elementFactory.createParticipantShape(collapsed));
  }

  assign(actions, {
    'custom-risk': createAction(
      'custom:risk', 'custom', 'icon-custom-risk', 'Create Risk'
    ),
    'custom-separator': {
      group: 'custom',
      separator: true
    },
    'lasso-tool': {
      group: 'tools',
      className: 'bpmn-icon-lasso-tool',
      title: 'Activate the lasso tool',
      action: {
        click: function (event) {
          lassoTool.activateSelection(event);
        }
      }
    },
    'space-tool': {
      group: 'tools',
      className: 'bpmn-icon-space-tool',
      title: 'Activate the create/remove space tool',
      action: {
        click: function (event) {
          spaceTool.activateSelection(event);
        }
      }
    },
    'tool-separator': {
      group: 'tools',
      separator: true
    },
    'create.start-event': createAction(
      'bpmn:StartEvent', 'event', 'bpmn-icon-start-event-none'
    ),
    'create.intermediate-event': createAction(
      'bpmn:IntermediateThrowEvent', 'event', 'bpmn-icon-intermediate-event-none'
    ),
    'create.end-event': createAction(
      'bpmn:EndEvent', 'event', 'bpmn-icon-end-event-none'
    ),
    'create.exclusive-gateway': createAction(
      'bpmn:ExclusiveGateway', 'gateway', 'bpmn-icon-gateway-xor'
    ),
    'create.task': createAction(
      'bpmn:Task', 'activity', 'bpmn-icon-task'
    ),
    'create.subprocess-expanded': createAction(
      'bpmn:SubProcess', 'activity', 'bpmn-icon-subprocess-expanded', 'Create expanded SubProcess',
      { isExpanded: true }
    ),
    'create.participant-expanded': {
      group: 'collaboration',
      className: 'bpmn-icon-participant',
      title: 'Create Pool/Participant',
      action: {
        dragstart: createParticipant,
        click: createParticipant
      }
    }
  });

  return actions;
};
