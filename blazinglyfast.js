(() => {
  console.log(document.currentScript.parentElement.tagName);

  const form = document.currentScript.parentElement;
  if (form.tagName !== "FORM") {
    console.warn("not a form");
    return;
  }

  const _styleSheetKey = `ezpez-${Math.random().toString(36).substring(2)}`;
  const style = `
  .${_styleSheetKey} {
    font-family: sans-serif;
  
    section {
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      max-width: 35ch;
    }
  
    input {
      font: inherit;
    }
  
    & > button {
      margin-top: 2em;
    }
  
    [data-bind]:empty {
      display: none;
    }
  }
  `;

  const stylesheet = document.createElement("style");
  stylesheet.textContent = style;
  form.classList.add(_styleSheetKey);
  form.append(stylesheet);

  const inputs = [...form.elements].filter(({ name }) => name?.length);
  const inputsNames = inputs.map(({ name }) => name);

  const bindings = new Map();
  [...form.querySelectorAll("[data-bind]")].forEach((node) => {
    const key = node.dataset.bind;
    if (!bindings.has(key)) {
      bindings.set(key, []);
    }
    bindings.get(key).push(node);
  });

  const syncBindings = () => {
    bindings.forEach((nodes) => {
      nodes.forEach((node) => {
        node.textContent = form.elements[node.dataset.bind]?.value || "";
      });
    });
  };

  form.addEventListener("input", syncBindings);
  form.addEventListener("change", syncBindings);
  form.addEventListener("reset", () => setTimeout(syncBindings));
  syncBindings();

  const prettyForm = (form) => {
    return [...new FormData(form).entries()].reduce((acc, [k, v]) => {
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

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    formResult.textContent = JSON.stringify(prettyForm(ev.target), null, 2);
  });
})();
