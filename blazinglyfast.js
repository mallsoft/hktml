(() => {
  const form = document.currentScript.parentElement;
  if (form.tagName !== "FORM") {
    console.error("not a form");
    return;
  }

  const _styleSheetKey = `ez-${Math.random()
    .toString(36)
    .substring(2)
    .slice(-5)}`;

  if (form.attributes["debug"] !== undefined) {
    console.warn("Form debug enabled");

    const pre = document.createElement("pre");
    pre.classList.add(`debug-${_styleSheetKey}`);
    form.insertBefore(pre, document.currentScript);

    form.addEventListener("dataupdate", ({ detail }) => {
      pre.textContent = JSON.stringify(
        {
          keys: inputsNames,
          data: prettyForm(form),
        },
        null,
        2
      );
    });
  }

  const prettyForm = (formNode) => {
    return [...new FormData(formNode).entries()].reduce((acc, [k, v]) => {
      if (!v) return acc;

      let current = acc;
      k.split(".").forEach((segment, i, arr) => {
        if (i === arr.length - 1) {
          current[segment] = v;
        } else {
          if (!current[segment]) {
            current[segment] = {};
          }
          current = current[segment];
        }
      });

      return acc;
    }, {});
  };

  const inputs = [...form.elements].filter(({ name }) => name?.length);
  const inputsNames = inputs.map(({ name }) => name);
  const bindings = new Map();
  [...form.querySelectorAll("[data-bind]")].forEach((node) => {
    const key = node.dataset.bind;
    if (!inputsNames.includes(key)) return;
    if (!bindings.has(key)) bindings.set(key, []);
    bindings.get(key).push(node);
  });

  const syncBindings = () => {
    bindings.forEach((nodes) => {
      nodes.forEach((node) => {
        node.textContent = form.elements[node.dataset.bind]?.value || "";
      });
    });

    const event = new CustomEvent("dataupdate", {
      bubbles: true,
      detail: prettyForm(form),
    });

    form.dispatchEvent(event);
  };

  form.addEventListener("input", syncBindings);
  form.addEventListener("change", syncBindings);
  form.addEventListener("reset", () => setTimeout(syncBindings));
  syncBindings();

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
  });

  const style = `
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .${_styleSheetKey} {
    [spin]{
      animation: spin 2s linear infinite; 
    }
    font-family: sans-serif;
    color: #313131;
    section {
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      max-width: 35ch;
    }
    input,button,textarea {
      font: inherit;
      color: inherit;
    }
    & > button {
      margin-top: 2em;
    }
    [data-bind]:empty {
      display: none;
    }
  }
  .debug-${_styleSheetKey}{
    position:fixed;
    top: 0;
    right: 0;
    z-index: 0;
    padding: 1em;
    margin: .5em;
    background-color: black;
    color: white;
    border: 1px solid gray;
  }
`;
  const stylesheet = document.createElement("style");
  stylesheet.textContent = style;
  form.classList.add(_styleSheetKey);
  form.append(stylesheet);
})();
